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
import { getOpenPositionPairs } from "../firebase/botState";
import { TRADING_CONFIG } from "@/config/trading";
import { latencyMonitor } from "@/services/monitor/latencyMonitor";
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
 * Menjalankan `worker` untuk tiap item di `items`, maksimal `limit`
 * proses berjalan bersamaan. Pola sama seperti scanner/index.ts.
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex]);
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

    await recordLog(
      "BOT",
      engineResult.success ? "success" : "warning",
      `Trading Engine (${pair}): ${engineResult.reason}`
    );

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
  candidatePairs?: string[]
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

  const pairs = Array.from(
    new Set(
      [
        ...(candidatePairs ?? []),
        ...openPositionPairs,
        ...TRADING_CONFIG.pairs,
      ]
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (candidatePairs && candidatePairs.length > 0) {
    await recordLog(
      "SYSTEM",
      "info",
      `Cron memproses ${pairs.length} pair (${candidatePairs.length} dari hasil scan market, ${openPositionPairs.length} posisi terbuka, ${TRADING_CONFIG.pairs.length} watchlist manual).`
    );
  }

  const results = await mapWithConcurrency(pairs, PAIR_CONCURRENCY, processPair);

  const finished = Date.now();

  // Tulis SATU ringkasan latensi panggilan Indodax untuk siklus ini
  // ke Firestore (lihat monitor/latencyMonitor.ts) -- membangun tren
  // "Indodax makin lambat/cepat" lintas waktu, tanpa menulis per-call
  // (yang boros write Firestore).
  await latencyMonitor.flush("indodax_public");

  return {
    success: results.every((r) => r.success),
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    pairsProcessed: pairs,
    results,
  };

}

/**
 * Alias
 */
export default executeCron;
