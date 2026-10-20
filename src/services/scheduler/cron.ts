/**
==========================================================
AURA Trade OS
Trading Scheduler (Cron)
Version : 0.1.0

Perubahan dari 0.0.9: executeCron() sekarang bisa menerima
daftar pair DINAMIS (hasil MarketScanner, seluruh market
Indodax) lewat parameter `candidatePairs`, bukan cuma
TRADING_CONFIG.pairs statis dari env var BOT_PAIRS.

Universe pair yang diproses tiap siklus = gabungan dari:
1. candidatePairs   -- top opportunities hasil scan seluruh
                        pair Indodax (kalau diberikan)
2. openPositionPairs -- pair yang SEDANG punya posisi terbuka,
                        SELALU diproses supaya stop-loss/
                        take-profit/SELL tetap jalan walau
                        pair itu sudah tidak lagi masuk top
                        opportunities di siklus scan berikutnya
3. TRADING_CONFIG.pairs -- watchlist manual dari env var
                        BOT_PAIRS, tetap dihormati sebagai
                        pair yang mau selalu dipantau operator

Kalau `candidatePairs` tidak diberikan (mis. dipanggil manual
tanpa scan), perilaku lama tetap jalan: TRADING_CONFIG.pairs +
openPositionPairs.

FITUR BARU -- Checklist Prioritas Pair (opt-in, lihat
BotControl.priorityPairs di services/firebase/botControl.ts):
operator bisa pilih dari dashboard SUBSET pair (dari top
candidatePairs siklus terbaru) yang mau benar-benar dieksekusi
otomatis. Kalau checklist ini diisi, pair top-N lain yang TIDAK
dicentang tetap ter-scan/terlihat di dashboard tapi TIDAK
dieksekusi TradingEngine ("second alternative", observability
saja) -- mengurangi jumlah pair diproses per siklus untuk
mengurangi risiko timeout. Kalau checklist kosong (default),
TIDAK ADA PERUBAHAN dari perilaku union lama.
==========================================================
*/
import { getCandles } from "../indodax/candles";
import {
  calculateRSI,
  calculateEMA,
  calculateMACD,
  calculateATR,
  calculateADX,
  calculateStochastic,
  calculateBollingerBands,
} from "../indicators";
import type { IndicatorFeatureVector } from "../indicators";
import { TradingEngine } from "../trading/engine";
import { recordLog } from "../firebase/logService";
import { isSampleTurn } from "../firebase/advisoryLogThrottle";
import { isFeatureEnabled } from "../firebase/featureFlags";
import { getOpenPositionPairs } from "../firebase/botState";
import { getBotControl } from "../firebase/botControl";
import { TRADING_CONFIG } from "@/config/trading";
import strategyManager from "@/services/strategy/manager";
import evaluator from "@/services/strategy/core/evaluator";
import entryRules from "@/services/strategy/rules/entryRules";
import strategyScore from "@/services/strategy/scoring/strategyScore";
import confidenceEngine from "@/services/strategy/scoring/confidence";

const RSI_PERIOD = 14;
const EMA_FAST_PERIOD = 9;
const EMA_SLOW_PERIOD = 21;

/**
 * Minimum candle untuk ADX/ATR/Stochastic yang butuh window
 * period+1 -- selaras dengan yang dipakai calculateADX/ATR
 * default (period=14).
 */
const MIN_CANDLES_FOR_FEATURES = 30;

/**
 * Berapa banyak pair diproses BERSAMAAN dalam satu siklus cron.
 * Sebelumnya sekuensial (satu-satu) -- untuk full-market scan
 * dengan puluhan pair kandidat + open position, itu gampang
 * melebihi timeout 30 detik cron-job.org/GitHub Actions walau
 * Vercel sendiri diberi budget 60 detik (lihat maxDuration di
 * scan.ts). Paralel dengan batas ini mengurangi wall-clock time
 * drastis tanpa membanjiri rate limiter Indodax (yang sudah
 * melindungi semua panggilan publik/private secara terpisah).
 */
const PAIR_CONCURRENCY = 5;

/**
 * Batas waktu (ms sejak awal SIKLUS) setelah itu pair baru TIDAK
 * dimulai lagi. cron-job.org memotong request di 30 detik; pair
 * yang sudah berjalan masih butuh beberapa detik (candle + AI
 * advisory <= 4 dtk + order), jadi pair baru dihentikan di 20 dtk.
 */
export const CYCLE_START_DEADLINE_MS = 20_000;

/**
 * Urutkan pair: posisi terbuka SELALU di depan (SL/TP/SELL tidak
 * boleh tertunda), sisanya diputar berdasarkan `rotation` supaya
 * pair di ekor daftar tidak terus-menerus terlewat saat waktu habis.
 */
export function orderPairsForCycle(
  pairs: string[],
  openPairs: string[],
  rotation: number
): string[] {
  const open = new Set(openPairs.map((p) => p.trim().toLowerCase()));
  const first = pairs.filter((p) => open.has(p));
  const rest = pairs.filter((p) => !open.has(p));
  if (rest.length === 0) return first;
  const shift = ((rotation % rest.length) + rest.length) % rest.length;
  return [...first, ...rest.slice(shift), ...rest.slice(0, shift)];
}

/**
 * Menjalankan `worker` untuk tiap item di `items`, maksimal `limit`
 * proses berjalan bersamaan. Pola sama seperti scanner/index.ts.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
  skip?: (item: T) => R | null
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      const skipped = skip ? skip(items[currentIndex]) : null;
      results[currentIndex] =
        skipped !== null ? skipped : await worker(items[currentIndex]);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, run));

  return results;
}

export interface CronPairResult {
  pair: string;
  success: boolean;
  message: string;
  durationMs: number;
  /**
   * Sinyal akhir dari TradingEngine (setelah sanity check &
   * risk-gate) -- dipakai api/bot/execute.ts untuk menghitung
   * statistik buySignals/sellSignals/holdSignals yang akurat,
   * bukan cuma angka nol hardcode seperti sebelumnya.
   */
  signal: "BUY" | "SELL" | "HOLD";
  /**
   * true kalau order BENAR-BENAR dieksekusi (bukan cuma sinyal
   * BUY/SELL yang lolos tapi diblokir risk-gate).
   */
  actionExecuted: boolean;
}

export interface CronResult {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  pairsProcessed: string[];
  results: CronPairResult[];
}

/**
 * Proses satu pair. Dipisah supaya try/catch-nya
 * terisolasi per pair.
 */
async function processPair(pair: string): Promise<CronPairResult> {

  const pairStarted = Date.now();

  try {

    await recordLog("SYSTEM", "info", `Cron execution started (${pair}).`);

    const candles = await getCandles({ pair, limit: 100 });

    const closePrices = candles.map((c) => c.close);

    if (closePrices.length < MIN_CANDLES_FOR_FEATURES) {
      throw new Error(
        `Data harga tidak cukup untuk ${pair} (dapat ${closePrices.length}, butuh minimal ${MIN_CANDLES_FOR_FEATURES})`
      );
    }

    const price = closePrices[closePrices.length - 1];
    const volume = candles[candles.length - 1].volume;

    const rsi = calculateRSI(closePrices, RSI_PERIOD);
    const emaFast = calculateEMA(closePrices, EMA_FAST_PERIOD);
    const emaSlow = calculateEMA(closePrices, EMA_SLOW_PERIOD);
    const macdResult = calculateMACD(closePrices);
    const atrResult = calculateATR(candles);
    const adxResult = calculateADX(candles);
    const stochasticResult = calculateStochastic(candles);
    const bollinger = calculateBollingerBands(closePrices);

    const features: IndicatorFeatureVector = {
      pair,
      price,
      volume,
      emaFast,
      emaSlow,
      rsi,
      macd: macdResult.macd,
      macdSignal: macdResult.signal,
      macdHistogram: macdResult.histogram,
      atr: atrResult.atr,
      adx: adxResult.adx,
      // plusDI/minusDI: sudah dihitung calculateADX() di atas tapi
      // sebelumnya dibuang -- diisi di sini (tanpa fetch/hitung ulang
      // apapun) supaya services/intelligence/ml/mlAdvisor.ts bisa
      // kirim fitur yang persis sama dengan saat training model
      // (lihat services/ml/dataset/collector.ts), bukan fallback 0.
      plusDI: adxResult.plusDI,
      minusDI: adxResult.minusDI,
      stochasticK: stochasticResult.k,
      stochasticD: stochasticResult.d,
      bollingerUpper: bollinger.upper,
      bollingerMiddle: bollinger.middle,
      bollingerLower: bollinger.lower,
    };

    const engineResult = await TradingEngine.run({
      pair,
      price,
      features,
      candles,
    });

    // HOLD rutin (tanpa aksi, tanpa error) disampling 1x/jam per pair untuk
    // hemat write Firestore (lihat advisoryLogThrottle.ts). Aksi, sinyal
    // non-HOLD, dan kegagalan SELALU ditulis.
    const routineHold =
      engineResult.success &&
      !engineResult.actionExecuted &&
      engineResult.signal === "HOLD";
    if (!routineHold || isSampleTurn(pair)) {
      await recordLog(
        "BOT",
        engineResult.success ? "success" : "warning",
        `Trading Engine (${pair}): ${engineResult.reason}`
      );
    }

    // --- Confidence Engine (INFO ONLY - lihat docs/claude.md,
    // strategyScore.ts SENGAJA dilepas dari gerbang keputusan BUY
    // di auraTrend.ts karena pernah bikin bug "silent double-gate".
    // Log ini TIDAK PERNAH mempengaruhi engineResult/decision di
    // atas - murni informasi tambahan untuk analitik/kalibrasi
    // manual nanti, dihitung ulang independen dari features yang
    // sama, tidak menyentuh alur keputusan sama sekali. ---
    try {

      const entryEvaluation = evaluator.evaluate(features, entryRules);
      const scoreResult = strategyScore.calculate(features);

      const confidenceResult = confidenceEngine.calculate(
        scoreResult,
        entryEvaluation
      );

      await recordLog(
        "BOT",
        "info",
        `[Confidence Info ${pair.toUpperCase()}] ${confidenceResult.level} (${confidenceResult.confidence}) - ${confidenceResult.explanation.join("; ")}. TIDAK mempengaruhi keputusan di atas.`
      );

    } catch (error) {

      // Fail-safe: gagal hitung confidence info TIDAK PERNAH boleh
      // menghentikan/mengganggu siklus trading yang sebenarnya.
      console.error(`[Confidence Info] Gagal dihitung untuk ${pair} (non-fatal):`, error);

    }

    return {
      pair,
      success: engineResult.success,
      message: engineResult.reason,
      durationMs: Date.now() - pairStarted,
      signal: engineResult.signal,
      actionExecuted: engineResult.actionExecuted,
    };

  }
  catch (error) {

    console.error(`[Scheduler] ${pair}`, error);

    await recordLog(
      "SYSTEM",
      "danger",
      `Cron execution failed for ${pair}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    return {
      pair,
      success: false,
      message: error instanceof Error ? error.message : "Unknown scheduler error",
      durationMs: Date.now() - pairStarted,
      signal: "HOLD",
      actionExecuted: false,
    };

  }

}

export async function executeCron(
  candidatePairs?: string[],
  options?: { cycleStartedAt?: number }
): Promise<CronResult> {

  const started = Date.now();

  // Rekonsiliasi status enable/disable strategi dari Firestore
  // SEKALI per siklus (bukan per-pair) - lihat strategy/registry.ts
  // + registryStore.ts. Fail-safe: kalau gagal, strategyRegistry
  // tetap pakai status terakhir yang sempat ter-cache (atau default
  // semua ACTIVE kalau ini invocation pertama) - tidak menghentikan
  // siklus cron.
  try {
    await strategyManager.refreshRegistry();
  } catch (error) {
    console.error("[Scheduler] Gagal refresh strategy registry (non-fatal):", error);
  }

  // Pair yang SEDANG open position -- selalu ikut diproses supaya
  // stop-loss/take-profit/SELL tetap jalan walau pair itu sudah
  // tidak lagi jadi top opportunity di siklus scan berikutnya.
  const openPositionPairs = await getOpenPositionPairs();

  // --- Checklist prioritas pair (opt-in, lihat BotControl.priorityPairs) ---
  // Kalau operator sudah pilih checklist dari dashboard (subset dari
  // top candidatePairs siklus TERBARU), HANYA pair yang dicentang
  // (dan overlap dengan candidatePairs siklus INI) yang dieksekusi
  // otomatis TradingEngine -- bukan seluruh candidatePairs+watchlist
  // seperti biasa. Ini sengaja mengurangi jumlah pair yang diproses
  // per siklus (cron-job.org hard limit 30 detik, lihat catatan
  // MAX_CANDIDATE_PAIRS_PER_CYCLE di scanCycle.ts).
  //
  // Kalau checklist KOSONG (default, belum pernah diisi dari
  // dashboard): TIDAK ADA PERUBAHAN PERILAKU -- tetap union penuh
  // candidatePairs + openPositionPairs + TRADING_CONFIG.pairs
  // seperti sebelum fitur ini ada.
  //
  // Fail-safe: kalau getBotControl() gagal (Firestore error), catch
  // di dalam fungsi itu sendiri sudah mengembalikan objek default
  // (priorityPairs undefined) -- tidak pernah melempar ke atas,
  // tidak pernah menghentikan siklus cron.
  const control = await getBotControl();

  const priorityPairs = (control.priorityPairs ?? [])
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  // Watchlist efektif: dari portal (Firestore) bila ada, jika tidak env/default.
  const effectiveWatchlist =
    control.watchlist && control.watchlist.length > 0
      ? control.watchlist.map((p) => p.trim().toLowerCase()).filter(Boolean)
      : TRADING_CONFIG.pairs;
  let pairs: string[];

  if (priorityPairs.length > 0) {

    const candidateSet = new Set(
      (candidatePairs ?? []).map((p) => p.trim().toLowerCase())
    );

    const focusedFromCandidates = priorityPairs.filter((p) =>
      candidateSet.has(p)
    );

    pairs = Array.from(
      new Set([
        ...openPositionPairs.map((p) => p.trim().toLowerCase()),
        ...focusedFromCandidates,
      ])
    );

    const skippedCandidates = (candidatePairs ?? []).filter(
      (p) => !priorityPairs.includes(p.trim().toLowerCase())
    );

    if (skippedCandidates.length > 0) {
      await recordLog(
        "BOT",
        "info",
        `[Priority Pairs] Checklist aktif (${priorityPairs.length} pair) -- ` +
          `${skippedCandidates.length} kandidat scanner TIDAK dieksekusi otomatis ` +
          `siklus ini (second alternative, cuma observability): ${skippedCandidates
            .map((p) => p.toUpperCase())
            .join(", ")}.`
      );
    }

  } else {

    // Flag watchlistOnly: abaikan kandidat scanner, proses watchlist
    // tetap + posisi terbuka saja (kandidat tetap discan/ditampilkan).
    const watchlistOnly = await isFeatureEnabled("watchlistOnly");
    // Kandidat scanner HANYA dieksekusi bila scannerExecution menyala
    // (default mati) dan watchlistOnly mati. Lihat featureFlags.ts.
    const scannerExecution = await isFeatureEnabled("scannerExecution");
    const executeCandidates = scannerExecution && !watchlistOnly;
    if (!executeCandidates && (candidatePairs?.length ?? 0) > 0) {
      await recordLog(
        "BOT",
        "info",
        `[Watchlist Only] ${candidatePairs!.length} kandidat scanner TIDAK dieksekusi siklus ini (scannerExecution mati atau watchlistOnly menyala); hanya watchlist (${effectiveWatchlist.length} pair) + posisi terbuka.`
      );
    }
    pairs = Array.from(
      new Set(
        [
          ...(executeCandidates ? candidatePairs ?? [] : []),
          ...openPositionPairs,
          ...effectiveWatchlist,
        ]
          .map((p) => p.trim().toLowerCase())
          .filter(Boolean)
      )
    );

  }

  if (candidatePairs && candidatePairs.length > 0) {
    await recordLog(
      "SYSTEM",
      "info",
      `Cron memproses ${pairs.length} pair (${candidatePairs.length} dari hasil scan market, ${openPositionPairs.length} posisi terbuka, ${effectiveWatchlist.length} watchlist).`
    );
  }

  // Pengaman batas waktu: posisi terbuka duluan, sisanya diputar per
  // menit; pair yang belum dimulai saat batas lewat dilewati (bukan
  // dipotong di tengah order) dan dicatat supaya terlihat di log.
  const deadlineAt =
    (options?.cycleStartedAt ?? started) + CYCLE_START_DEADLINE_MS;
  const orderedPairs = orderPairsForCycle(
    pairs,
    openPositionPairs,
    Math.floor(started / 60_000)
  );
  const skippedForTime: string[] = [];

  const results = await mapWithConcurrency(
    orderedPairs,
    PAIR_CONCURRENCY,
    processPair,
    (pair): CronPairResult | null => {
      if (Date.now() <= deadlineAt) return null;
      skippedForTime.push(pair);
      return {
        pair,
        success: true,
        message: "Dilewati: batas waktu siklus tercapai (giliran berikutnya).",
        durationMs: 0,
        signal: "HOLD",
        actionExecuted: false,
      };
    }
  );

  if (skippedForTime.length > 0) {
    await recordLog(
      "SYSTEM",
      "warning",
      `[Batas Waktu] ${skippedForTime.length}/${orderedPairs.length} pair dilewati siklus ini ` +
        `(lewat ${CYCLE_START_DEADLINE_MS / 1000} dtk): ` +
        `${skippedForTime.map((p) => p.toUpperCase()).join(", ")}. ` +
        `Kurangi jumlah watchlist bila ini sering muncul.`
    );
  }

  const finished = Date.now();

  // Flush latensi ke Firestore (latency_stats/*/entries) DIHENTIKAN
  // 2026-10-18: ditulis tiap siklus (~1.440 write/hari) tapi tidak
  // pernah dibaca (getRecentStats tidak dipanggil siapa pun) dan tidak
  // pernah dibersihkan. Aktifkan lagi hanya bila ada pembaca + retensi.

  return {
    success: results.every((r) => r.success),
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    pairsProcessed: orderedPairs.filter((p) => !skippedForTime.includes(p)),
    results,
  };

}

/**
 * Alias
 */
export default executeCron;
