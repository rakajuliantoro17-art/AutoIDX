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
import { TRADING_CONFIG } from "@/config/trading";

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
//
// FIX (503 di Vercel Hobby): sebelumnya 60 -- dikombinasikan dengan
// TRADES_CONCURRENCY=8 lama, itu 60/8 = 8 gelombang request
// berurutan, cukup untuk membuat scanMarket() saja >10 detik (lihat
// catatan lengkap FIX 503 di minVolumeIdr, config/trading.ts). Ini
// LEBIH MENENTUKAN daripada threshold volume, karena menaikkan
// minVolumeIdr TIDAK MENJAMIN kandidat turun di bawah batas ini --
// Indodax bisa saja tetap punya 60+ pair di atas threshold berapa
// pun. Diturunkan ke 30 supaya jumlah gelombang PASTI kecil,
// terlepas kondisi pasar.
const DEEP_SCAN_LIMIT = 30;

// Berapa banyak request "trades" boleh berjalan bersamaan.
//
// FIX (503 di Vercel Hobby): dinaikkan dari 8 ke 16. Dikombinasikan
// dengan DEEP_SCAN_LIMIT=30 di atas, worst case sekarang cuma 2
// gelombang (30/16, dibulatkan ke atas) -- sebelumnya 8 gelombang
// (60/8). Masih jauh di bawah rate limit publik Indodax (180
// request/menit): satu siklus penuh cuma memakai puluhan request,
// bukan ratusan, dan siklus berikutnya baru mulai lagi beberapa
// puluh detik kemudian (lihat interval cron-job.org).
const TRADES_CONCURRENCY = 16;

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
