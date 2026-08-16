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
==========================================================
*/

import indodaxMarketService from "../indodax/market";

import {
  analyzeTechnicalIndicators,
} from "../indicators";

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

    const qualified: ScannedPairResult[] = [];

    // 5. Analisa RSI/EMA (butuh data trades per-pair) hanya untuk kandidat,
    //    dengan concurrency terbatas.
    await mapWithConcurrency(candidates, TRADES_CONCURRENCY, async (ticker) => {
      try {
        const prices = await indodaxMarketService.getPriceSeries(ticker.pair, 50);

        if (prices.length < 25) {
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

        if (score < 60) {
          return;
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
        });
      } catch (error) {
        console.error("Scanner failed", ticker.pair, error);
      }
    });

    qualified.sort((a, b) => b.opportunityScore - a.opportunityScore);

    return {
      scannedCount: consideredPairs.length,
      qualifiedCount: qualified.length,
      topOpportunities: qualified.slice(0, 10),
      qualifiedPairs: qualified.map((q) => q.pair),
      scannedAt: new Date().toISOString(),
    };
  }
}

export default new MarketScanner();

export * from "./types";
export * from "./filter";
