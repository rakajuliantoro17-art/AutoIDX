/**
==========================================================
AURA Trade OS
ML Shadow Scoring (fungsi murni, tanpa I/O)
Version : 0.1.0

Menilai prediksi model ML terhadap harga SEBENARNYA setelahnya.
Dipakai mode shadow: prediksi hanya dicatat, tidak memengaruhi
BUY/SELL. Aturan label SAMA dengan training (POST /api/ml/train):
return N candle ke depan >= +2% BUY, <= -2% SELL, selain itu HOLD,
dihitung lewat LabelingEngine supaya definisinya satu sumber.

Evaluasi memakai ModelEvaluator dan dibandingkan dengan baseline
jujur: (1) selalu menebak kelas mayoritas, (2) rata-rata return
semua kondisi. Model baru layak dipertimbangkan kalau mengalahkan
keduanya, bukan sekadar "akurat".
==========================================================
*/

import labelingEngine from "../labeling/engine";
import modelEvaluator from "../models/evaluator";
import type { PredictionLabel } from "../types";

export const SHADOW_RESOLUTION = "60";
export const SHADOW_HORIZON_CANDLES = 10;
export const SHADOW_BUY_THRESHOLD = 0.02;
export const SHADOW_SELL_THRESHOLD = -0.02;
export const MIN_SCORED_FOR_VERDICT = 30;

const HORIZON_MS = SHADOW_HORIZON_CANDLES * 3600_000;
/** Candle yang diambil cron hanya ~100 jam; lewat itu tidak bisa dinilai. */
const EXPIRE_AFTER_MS = 90 * 3600_000;

export interface ShadowPrediction {
  id: string;
  pair: string;
  price: number;
  label: PredictionLabel;
  confidence: number;
  modelId: string;
  createdAtMs: number;
}

export interface ShadowCandle {
  time: number; // detik
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type ScoreOutcome =
  | { status: "PENDING" }
  | { status: "EXPIRED" }
  | { status: "SCORED"; actual: PredictionLabel; futureReturn: number };

export function isDue(p: ShadowPrediction, now: number): boolean {
  return now - p.createdAtMs >= HORIZON_MS;
}

export function scorePrediction(
  p: ShadowPrediction,
  candles: ShadowCandle[],
  now: number
): ScoreOutcome {
  if (!isDue(p, now)) return { status: "PENDING" };

  const future = candles
    .filter((c) => c.time * 1000 > p.createdAtMs)
    .sort((a, b) => a.time - b.time)
    .map((c) => ({
      timestamp: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));

  if (future.length < SHADOW_HORIZON_CANDLES) {
    return now - p.createdAtMs > EXPIRE_AFTER_MS
      ? { status: "EXPIRED" }
      : { status: "PENDING" };
  }

  const result = labelingEngine.generate(
    {
      timestamp: p.createdAtMs / 1000,
      open: p.price,
      high: p.price,
      low: p.price,
      close: p.price,
      volume: 0,
    },
    future,
    {
      futureCandles: SHADOW_HORIZON_CANDLES,
      buyThreshold: SHADOW_BUY_THRESHOLD,
      sellThreshold: SHADOW_SELL_THRESHOLD,
    }
  );

  return { status: "SCORED", actual: result.label, futureReturn: result.futureReturn };
}

export interface ScoredPrediction {
  predicted: PredictionLabel;
  actual: PredictionLabel;
  confidence: number;
  futureReturn: number; // pecahan, 0.01 = 1%
}

export type ShadowVerdict =
  | "DATA_KURANG"
  | "BELUM_MENGALAHKAN_BASELINE"
  | "MENGALAHKAN_BASELINE";

export interface ShadowSummary {
  scored: number;
  accuracy: number;
  majorityBaselineAccuracy: number;
  buyCount: number;
  avgReturnWhenBuyPercent: number | null;
  avgReturnAllPercent: number;
  buyPrecision: number;
  buyRecall: number;
  verdict: ShadowVerdict;
  note: string;
}

export function summarize(items: ScoredPrediction[]): ShadowSummary {
  const n = items.length;

  const report = modelEvaluator.evaluate(
    items.map((i) => ({
      actual: i.actual,
      predicted: i.predicted,
      confidence: i.confidence,
    }))
  );

  const counts: Record<string, number> = {};
  for (const i of items) counts[i.actual] = (counts[i.actual] ?? 0) + 1;
  const majority = n === 0 ? 0 : Math.max(...Object.values(counts)) / n;

  const buys = items.filter((i) => i.predicted === "BUY" || i.predicted === "STRONG_BUY");
  const avgAll = n === 0 ? 0 : (items.reduce((s, i) => s + i.futureReturn, 0) / n) * 100;
  const avgBuy =
    buys.length === 0
      ? null
      : (buys.reduce((s, i) => s + i.futureReturn, 0) / buys.length) * 100;

  let verdict: ShadowVerdict;
  let note: string;

  if (n < MIN_SCORED_FOR_VERDICT) {
    verdict = "DATA_KURANG";
    note = `Baru ${n} prediksi ternilai (min ${MIN_SCORED_FOR_VERDICT}). Belum ada kesimpulan.`;
  } else if (report.accuracy >= majority + 0.05 && avgBuy !== null && avgBuy > avgAll) {
    verdict = "MENGALAHKAN_BASELINE";
    note =
      "Akurasi di atas tebakan kelas mayoritas (+5 poin) dan return setelah sinyal BUY lebih baik dari rata-rata. " +
      "Masih shadow: butuh persetujuan terpisah sebelum dipakai sebagai gerbang order.";
  } else {
    verdict = "BELUM_MENGALAHKAN_BASELINE";
    note =
      "Model belum lebih baik dari tebakan sederhana. Jangan dipakai untuk keputusan order.";
  }

  return {
    scored: n,
    accuracy: report.accuracy,
    majorityBaselineAccuracy: majority,
    buyCount: buys.length,
    avgReturnWhenBuyPercent: avgBuy,
    avgReturnAllPercent: avgAll,
    buyPrecision: report.precision,
    buyRecall: report.recall,
    verdict,
    note,
  };
}
