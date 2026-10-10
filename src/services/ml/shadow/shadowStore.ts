/**
==========================================================
AURA Trade OS
ML Shadow Store + Job (server-only)
Version : 0.1.0

Koleksi Firestore:
- ml_shadow_predictions : satu dokumen per pair per bucket 15 menit
  (id deterministik -> siklus scan yang berulang tidak menggandakan).
- ml_shadow_scores/summary : ringkasan terbaru (dibaca halaman/endpoint).

Semua fungsi di sini dipanggil di balik flag `aiShadowPrediction`
dan WAJIB fail-safe: tidak boleh melempar ke jalur trading.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { getCandles } from "@/services/indodax/candles";
import {
  SHADOW_RESOLUTION,
  ScoredPrediction,
  ShadowPrediction,
  ShadowSummary,
  isDue,
  scorePrediction,
  summarize,
} from "./scoring";
import type { PredictionLabel } from "../types";

const PRED = "ml_shadow_predictions";
const SCORES = "ml_shadow_scores";
const BUCKET_MS = 15 * 60_000;
const MAX_PER_RUN = 40;
const MAX_SUMMARY_DOCS = 300;

export async function recordShadowPrediction(input: {
  pair: string;
  price: number;
  label: PredictionLabel;
  confidence: number;
  modelId: string;
}): Promise<void> {
  const now = Date.now();
  const bucket = Math.floor(now / BUCKET_MS);
  const pair = input.pair.toLowerCase();

  await adminDb
    .collection(PRED)
    .doc(`${pair}_${bucket}`)
    .set({
      pair,
      price: input.price,
      label: input.label,
      confidence: input.confidence,
      modelId: input.modelId,
      createdAtMs: now,
      resolution: SHADOW_RESOLUTION,
      scored: false,
    });
}

export interface ShadowJobResult {
  checked: number;
  scored: number;
  expired: number;
  summary: ShadowSummary | null;
}

/** Nilai prediksi yang sudah jatuh tempo, lalu perbarui ringkasan. */
export async function runShadowScoring(now = Date.now()): Promise<ShadowJobResult> {
  const snap = await adminDb.collection(PRED).where("scored", "==", false).limit(200).get();

  const due: ShadowPrediction[] = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ShadowPrediction, "id">) }))
    .filter((p) => isDue(p, now))
    .slice(0, MAX_PER_RUN);

  const byPair = new Map<string, ShadowPrediction[]>();
  for (const p of due) byPair.set(p.pair, [...(byPair.get(p.pair) ?? []), p]);

  let scored = 0;
  let expired = 0;

  for (const [pair, preds] of byPair) {
    let candles;
    try {
      candles = await getCandles({ pair, resolution: SHADOW_RESOLUTION, limit: 100 });
    } catch {
      continue; // coba lagi di run berikutnya
    }

    for (const p of preds) {
      const out = scorePrediction(p, candles, now);
      if (out.status === "SCORED") {
        await adminDb.collection(PRED).doc(p.id).update({
          scored: true,
          actual: out.actual,
          futureReturn: out.futureReturn,
          scoredAtMs: now,
        });
        scored++;
      } else if (out.status === "EXPIRED") {
        await adminDb.collection(PRED).doc(p.id).update({ scored: true, expired: true, scoredAtMs: now });
        expired++;
      }
    }
  }

  let summary: ShadowSummary | null = null;

  if (scored > 0) {
    const done = await adminDb.collection(PRED).where("scored", "==", true).limit(1000).get();
    const items = done.docs
      .map((d) => d.data())
      .filter((d) => !d.expired && d.actual)
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, MAX_SUMMARY_DOCS)
      .map<ScoredPrediction>((d) => ({
        predicted: d.label,
        actual: d.actual,
        confidence: d.confidence,
        futureReturn: d.futureReturn,
      }));

    summary = summarize(items);
    await adminDb
      .collection(SCORES)
      .doc("summary")
      .set({ ...summary, updatedAtMs: now });
  }

  return { checked: due.length, scored, expired, summary };
}
