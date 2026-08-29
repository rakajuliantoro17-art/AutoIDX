/**
==========================================================
AURA Trade OS
Market Scanner Engine
Version : 0.2.0 Alpha

Perubahan dari versi sebelumnya:
- Universe pair TIDAK lagi hardcode 5 pair (btc/eth/sol/ada/xrp).
  Default sekarang mengambil SELURUH pair yang tersedia di Indodax
  lewat GET /api/pairs.
- Prefilter volume memakai GET /api/summaries (1 request untuk
  SEMUA pair sekaligus), jadi tidak perlu ratusan request ticker
  cuma untuk tahu volume tiap pair.
- Analisa RSI/EMA (yang butuh data trades per-pair) hanya dijalankan
  untuk kandidat yang sudah lolos filter volume, dengan concurrency
  terbatas supaya tetap aman di bawah rate limit publik Indodax
  (180 request/menit).
- minOpportunityScore SEKARANG BENAR-BENAR dipakai dari ScanCriteria
  (sebelumnya hardcode 60, parameter ini ada di tipe tapi diam-diam
  diabaikan). scoreStats juga ditambahkan supaya threshold-nya bisa
  dievaluasi pakai data asli, bukan tebakan.
==========================================================
*/

import indodaxMarketService from "../indodax/market";

import {
  analyzeTechnicalIndicators,
} from "../indicators";
import { isValidSeries } from "../indicators/utils";

import {
  calculateOpportunityScore,
  deriveSignalRecommendation,
  calculateConfidence,
} from "./filter";

import {
  ScanCriteria,
  ScannedPairResult,
  MarketScanSummary,
} from "./types";

// --- AI Prediction Engine (services/ai/prediction) ---------------------
// Ini adalah PEMANFAATAN PERTAMA dari folder "ai/" yang sebelumnya
// orphan (belum pernah dipakai di jalur mana pun). Sengaja diambil
// bagian PALING SEDERHANA & SUDAH ADA IMPLEMENTASI NYATANYA saja
// (BasicPredictionModel -- skor komposit dari indikator ternormalisasi),
// BUKAN seluruh mesin ai/training, ai/lifecycle, ai/optimizer dkk yang
// masih berupa kerangka arsitektur tanpa model sungguhan di baliknya.
// Skor AI ini murni untuk DIPANTAU dulu (ditampilkan di scanner),
// BELUM dipakai untuk memblokir/memicu BUY-SELL otomatis.
import { PredictionEngine } from "../ai/prediction/predictionEngine";
import { BasicPredictionModel } from "../ai/prediction/predictionModel";
import type { PredictionInput } from "../ai/prediction/predictionInput";

// --- Market Quality Filter (services/market/filters, sebelumnya orphan) ---
// SpreadFilter jadi gerbang tambahan SETELAH skor RSI/EMA lolos: pair
// dengan spread bid-ask terlalu lebar (order book tipis, rawan slippage
// besar saat full-pair auto-trading) TIDAK diloloskan ke qualifiedPairs,
// walau volume & skornya bagus. Lihat catatan lengkap di marketQuality.ts.
import { evaluateMarketQuality, evaluateVolumeSurge } from "./marketQuality";
import { getCandles } from "../indodax/candles";

// --- Circuit Breaker (services/resilience, sebelumnya orphan) ---
// Satu instance DIBAGIKAN sepanjang satu siklus scanMarket() (bukan
// lintas siklus -- state in-memory tidak bisa diandalkan lintas
// invocation di Vercel serverless, lihat catatan lengkap di komentar
// scanMarket()). Nilainya: kalau Indodax down TOTAL di tengah scan,
// setelah beberapa kegagalan beruntun breaker akan OPEN dan sisa
// kandidat di siklus yang sama gagal cepat (fail-fast) alih-alih
// tetap mencoba network call yang pasti gagal untuk puluhan pair
// berikutnya -- menghemat waktu & kuota rate-limit untuk outage yang
// sama.
import { CircuitBreaker } from "../resilience/circuitBreaker";

const aiPredictionEngine = new PredictionEngine(new BasicPredictionModel());

/**
 * Mengubah indikator teknikal mentah (RSI 0-100, EMA dalam satuan
 * harga, dll) menjadi sinyal ternormalisasi -1..1 supaya bisa
 * di-rata-rata secara bermakna oleh BasicPredictionModel. Tanpa ini,
 * EMA yang bernilai jutaan akan mendominasi rata-rata dan membuat
 * skor AI tidak berarti apa-apa.
 */
function buildNormalizedIndicators(params: {
  rsi14: number;
  emaFast: number;
  emaSlow: number;
  opportunityScore: number;
}): Record<string, number> {
  const rsiSignal = clamp((50 - params.rsi14) / 50, -1, 1);

  const emaSpreadPct =
    params.emaSlow !== 0
      ? (params.emaFast - params.emaSlow) / params.emaSlow
      : 0;
  const emaSignal = clamp(emaSpreadPct * 20, -1, 1);

  const momentumSignal = clamp((params.opportunityScore - 50) / 50, -1, 1);

  return { rsiSignal, emaSignal, momentumSignal };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Berapa banyak pair (yang sudah lolos filter volume) yang dianalisa
// RSI/EMA secara mendalam per siklus scan. Dibatasi supaya jumlah
// request ke Indodax (trades per pair) tidak berlebihan.
const DEEP_SCAN_LIMIT = 60;

// Berapa banyak request "trades" boleh berjalan bersamaan.
const TRADES_CONCURRENCY = 8;

// Dipakai HANYA kalau /api/pairs gagal diakses total (network error dll),
// supaya scanner tidak mati total -- bukan lagi daftar utama.
const FALLBACK_PAIRS = ["btc_idr", "eth_idr", "sol_idr", "ada_idr", "xrp_idr"];

// `market.js` masih plain JavaScript (belum dimigrasi ke .ts), jadi
// TypeScript tidak bisa menyimpulkan bentuk objek yang dikembalikan
// getSummaryTickers(). Interface ini mendeskripsikan bentuknya secara
// eksplisit supaya scanner tetap type-safe.
interface MarketSnapshotTicker {
  pair: string;
  symbol: string;
  lastPrice: number;
  high24h: number;
  low24h: number;
  change24h: number;
  buyPrice: number;
  sellPrice: number;
  volCoin: number;
  volIdr: number;
  serverTime?: number;
}

/**
 * Menjalankan `worker` untuk tiap item di `items`, maksimal `limit`
 * proses berjalan bersamaan. Dipakai supaya scan ratusan pair tidak
 * menembak Indodax dengan ratusan request sekaligus.
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

export class MarketScanner {
  async scanMarket(
    pairsToScan?: string[],
    criteria: Partial<ScanCriteria> = {}
  ): Promise<MarketScanSummary> {
    const minVolume = criteria.minVolumeIdr ?? 50_000_000;

    // 1. Snapshot harga SELURUH pair dalam satu request.
    const marketSnapshot =
      (await indodaxMarketService.getSummaryTickers()) as MarketSnapshotTicker[];

    // 2. Tentukan universe pair yang dipindai. Kalau tidak diberi
    //    daftar spesifik (mis. lewat ?pairs= di API), ambil SEMUA
    //    pair yang ada di Indodax.
    let universe = pairsToScan?.map((p) => p.toLowerCase());
    if (!universe || universe.length === 0) {
      universe = await indodaxMarketService.getAllTradingPairs();
    }
    if (!universe || universe.length === 0) {
      universe = FALLBACK_PAIRS;
    }
    const universeSet = new Set(universe);

    // 3. Pair yang benar-benar dipertimbangkan pada siklus ini
    //    (irisan antara universe & pair yang datanya tersedia di
    //    snapshot Indodax).
    const consideredPairs = marketSnapshot.filter((t) => universeSet.has(t.pair));

    // 4. Prefilter volume TANPA request tambahan (data sudah ada di snapshot),
    //    lalu ambil kandidat volume tertinggi untuk dianalisa lebih dalam.
    const candidates = consideredPairs
      .filter((t) => t.volIdr >= minVolume)
      .sort((a, b) => b.volIdr - a.volIdr)
      .slice(0, DEEP_SCAN_LIMIT);

    // Diagnostik: volIdr tertinggi yang benar-benar terlihat di
    // consideredPairs, SEBELUM difilter minVolume. Lihat catatan di
    // types.ts (MarketScanSummary.maxVolIdrSeen).
    const maxVolIdrSeen =
      consideredPairs.length > 0
        ? Math.max(...consideredPairs.map((t) => t.volIdr))
        : 0;

    const minOpportunityScore = criteria.minOpportunityScore ?? 60;

    const maxSpreadPercent = criteria.maxSpreadPercent ?? 3;

    const qualified: ScannedPairResult[] = [];

    // Dibuat SEKALI per siklus scanMarket() ini, dibagikan ke semua
    // kandidat yang diproses mapWithConcurrency di bawah. TIDAK
    // disimpan sebagai field class/module-level -- sengaja dibuang
    // begitu scanMarket() ini selesai, karena instance baru akan
    // dibuat lagi di panggilan scanMarket() berikutnya (cron/API
    // route berikutnya). Ini scoped ke SATU siklus, bukan proteksi
    // permanen lintas waktu -- lihat catatan impor di atas.
    const breaker = new CircuitBreaker();

    // Skor SEMUA kandidat yang berhasil dianalisa (bukan cuma yang
    // qualified) -- dipakai untuk scoreStats di bawah, supaya bisa
    // dipantau apakah threshold minOpportunityScore terlalu ketat
    // (skor-skor menumpuk sedikit di bawah threshold) atau memang
    // market sedang sepi peluang (skor jauh di bawah threshold).
    const allScores: number[] = [];

    // 5. Analisa RSI/EMA (butuh data trades per-pair) hanya untuk kandidat,
    //    dengan concurrency terbatas.
    await mapWithConcurrency(candidates, TRADES_CONCURRENCY, async (ticker) => {
      try {
        const prices = await breaker.execute(() =>
          indodaxMarketService.getPriceSeries(ticker.pair, 50)
        );

        if (prices.length < 25) {
          return;
        }

        // Integrasi indicators/utils.ts (sebelumnya orphan): pastikan
        // seluruh price series adalah angka valid (finite, >= 0)
        // SEBELUM dipakai hitung RSI/EMA. Sebelumnya cuma dicek
        // panjangnya -- kalau Indodax pernah mengembalikan data
        // korup (NaN/negatif di satu titik), itu akan diam-diam ikut
        // dihitung dan menghasilkan opportunityScore yang salah tanpa
        // ada yang sadar.
        if (!isValidSeries(prices)) {
          console.error(
            `[SCANNER] Price series tidak valid untuk ${ticker.pair}, dilewati.`
          );
          return;
        }

        const tech = analyzeTechnicalIndicators(prices);

        const score = calculateOpportunityScore({
          rsi: tech.rsi14,
          emaFast: tech.emaFast,
          emaSlow: tech.emaSlow,
          volumeIdr: ticker.volIdr,
          change24h: ticker.change24h ?? 0,
        });

        allScores.push(score);

        if (score < minOpportunityScore) {
          return;
        }

        // --- Market Quality Gate: spread bid-ask (lihat marketQuality.ts) ---
        // Pair dengan spread terlalu lebar TIDAK diloloskan, walau skor
        // RSI/EMA-nya bagus -- order book tipis = risiko slippage besar
        // saat order benar-benar dieksekusi.
        let spreadPercent: number | undefined;

        try {
          const depth = await breaker.execute(() =>
            indodaxMarketService.getOrderBookDepth(ticker.pair, 20)
          );

          const quality = evaluateMarketQuality(
            ticker.pair,
            depth,
            maxSpreadPercent
          );

          spreadPercent = quality.spreadPercent;

          if (!quality.passed) {
            return;
          }
        } catch (qualityError) {
          // Gagal ambil order book (mis. network error sesaat) --
          // fail-safe dengan TETAP meloloskan pair (bukan menolak),
          // supaya satu error transien tidak menghilangkan pair
          // yang sebenarnya sehat dari hasil scan.
          console.error(
            "Market quality check failed",
            ticker.pair,
            qualityError
          );
        }

        // --- Volume Surge (informasional, lihat marketQuality.ts) ---
        let volumeRatio: number | undefined;
        let priceRangePercent: number | undefined;

        try {
          const candles = await breaker.execute(() =>
            getCandles({ pair: ticker.pair, limit: 50 })
          );
          const surge = evaluateVolumeSurge(candles, ticker.pair);

          if (surge) {
            volumeRatio = surge.volumeRatio;
            priceRangePercent = surge.priceRangePercent;
          }
        } catch (surgeError) {
          // Informasional saja -- gagal ambil candle TIDAK BOLEH
          // menggagalkan hasil scan pair ini.
          console.error("Volume surge check failed", ticker.pair, surgeError);
        }

        // --- AI Score (observasional, lihat catatan di atas import) ---
        let aiScore: number | undefined;
        let aiDirection: "BULLISH" | "BEARISH" | "NEUTRAL" | undefined;
        let aiConfidence: number | undefined;

        try {
          const predictionInput: PredictionInput = {
            symbol: ticker.pair,
            horizon: 15, // menit, placeholder -- belum ada validasi historis
            price: ticker.lastPrice,
            indicators: buildNormalizedIndicators({
              rsi14: tech.rsi14,
              emaFast: tech.emaFast,
              emaSlow: tech.emaSlow,
              opportunityScore: score,
            }),
          };

          const prediction = aiPredictionEngine.predict(predictionInput);
          aiScore = prediction.score;
          aiDirection = prediction.direction;
          aiConfidence = prediction.confidence;
        } catch (aiError) {
          // AI layer gagal TIDAK BOLEH menggagalkan hasil scan inti
          // (RSI/EMA/volume) -- cukup di-log, field aiScore dkk
          // dibiarkan undefined untuk pair ini.
          console.error("AI prediction failed", ticker.pair, aiError);
        }

        qualified.push({
          pair: ticker.pair,
          symbol: ticker.symbol,
          lastPrice: ticker.lastPrice,
          volIdr: ticker.volIdr,
          change24h: ticker.change24h,
          rsi14: tech.rsi14,
          emaFast: tech.emaFast,
          emaSlow: tech.emaSlow,
          trend: tech.trend,
          opportunityScore: score,
          confidence: calculateConfidence(score),
          signalRecommendation: deriveSignalRecommendation(score),
          aiScore,
          aiDirection,
          aiConfidence,
          spreadPercent,
          volumeRatio,
          priceRangePercent,
        });
      } catch (error) {
        console.error("Scanner failed", ticker.pair, error);
      }
    });

    qualified.sort((a, b) => b.opportunityScore - a.opportunityScore);

    const scoreStats =
      allScores.length > 0
        ? {
            analyzedCount: allScores.length,
            minScore: Math.min(...allScores),
            maxScore: Math.max(...allScores),
            avgScore:
              Math.round(
                (allScores.reduce((sum, s) => sum + s, 0) / allScores.length) * 100
              ) / 100,
            thresholdUsed: minOpportunityScore,
          }
        : {
            analyzedCount: 0,
            minScore: 0,
            maxScore: 0,
            avgScore: 0,
            thresholdUsed: minOpportunityScore,
          };

    return {
      scannedCount: consideredPairs.length,
      candidatesCount: candidates.length,
      maxVolIdrSeen,
      qualifiedCount: qualified.length,
      topOpportunities: qualified.slice(0, 10),
      qualifiedPairs: qualified.map((q) => q.pair),
      scoreStats,
      scannedAt: new Date().toISOString(),
    };
  }
}

export default new MarketScanner();

export * from "./types";
export * from "./filter";
