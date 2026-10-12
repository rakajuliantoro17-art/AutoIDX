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
const MAX_PER_RUN = 100;
/** Jarak minimum antar penghitungan ulang ringkasan (hemat pembacaan Firestore). */
const SUMMARY_MIN_INTERVAL_MS = 3 * 3600_000;
/** Anggaran waktu default satu proses penilaian (ms); sisa dikerjakan run berikutnya. */
const DEFAULT_BUDGET_MS = 8_000;
const PAIR_FETCH_CONCURRENCY = 4;
const MAX_SUMMARY_DOCS = 300;

export async function recordShadowPrediction(input: {
  pair: string;
  price: number;
  label: PredictionLabel;
  confidence: number;
  modelId: string;
  /** "ml" (default) atau sumber lain, mis. "llm:openai", "llm:claude", "llm:consensus". */
  source?: string;
}): Promise<void> {
  const now = Date.now();
  const bucket = Math.floor(now / BUCKET_MS);
  const pair = input.pair.toLowerCase();
  const source = input.source ?? "ml";
  // id ML dipertahankan (kontinuitas data); sumber lain diberi awalan.
  const id = source === "ml" ? `${pair}_${bucket}` : `${source.replace(/[^a-z0-9:_-]/gi, "")}_${pair}_${bucket}`;

  await adminDb
    .collection(PRED)
    .doc(id)
    .set({
      source,
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
  bySource?: Record<string, ShadowSummary>;
}

/** Nilai prediksi yang sudah jatuh tempo, lalu perbarui ringkasan. */
export async function runShadowScoring(
  now = Date.now(),
  budgetMs = DEFAULT_BUDGET_MS
): Promise<ShadowJobResult> {
  const deadline = Date.now() + budgetMs;
  const snap = await adminDb.collection(PRED).where("scored", "==", false).limit(150).get();

  // Terlama dulu: prediksi yang sudah jatuh tempo tidak boleh kelaparan
  // di belakang prediksi baru (query tanpa urutan sebelumnya mengambil acak).
  const due: ShadowPrediction[] = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<ShadowPrediction, "id">) }))
    .filter((p) => isDue(p, now))
    .sort((a, b) => a.createdAtMs - b.createdAtMs)
    .slice(0, MAX_PER_RUN);

  const byPair = new Map<string, ShadowPrediction[]>();
  for (const p of due) byPair.set(p.pair, [...(byPair.get(p.pair) ?? []), p]);

  let scored = 0;
  let expired = 0;

  const pairQueue = Array.from(byPair.entries());
  let cursor = 0;

  async function worker() {
    while (cursor < pairQueue.length && Date.now() < deadline) {
      const [pair, preds] = pairQueue[cursor++];
      let candles;
      try {
        candles = await getCandles({ pair, resolution: SHADOW_RESOLUTION, limit: 100 });
      } catch {
        continue; // coba lagi di run berikutnya
      }

      const batch = adminDb.batch();
      let writes = 0;
      for (const p of preds) {
        const out = scorePrediction(p, candles, now);
        const ref = adminDb.collection(PRED).doc(p.id);
        if (out.status === "SCORED") {
          batch.update(ref, {
            scored: true,
            actual: out.actual,
            futureReturn: out.futureReturn,
            scoredAtMs: now,
          });
          scored++;
          writes++;
        } else if (out.status === "EXPIRED") {
          batch.update(ref, { scored: true, expired: true, scoredAtMs: now });
          expired++;
          writes++;
        }
      }
      if (writes > 0) await batch.commit();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(PAIR_FETCH_CONCURRENCY, Math.max(1, pairQueue.length)) }, worker)
  );

  let summary: ShadowSummary | null = null;
  let bySource: Record<string, ShadowSummary> | undefined;

  // Ringkasan dihitung ulang paling sering tiap 3 jam: pembacaan 400 dokumen
  // per perhitungan terlalu mahal untuk dilakukan tiap proses (kuota gratis).
  let summaryDue = scored > 0;
  if (summaryDue) {
    try {
      const prev = await adminDb.collection(SCORES).doc("by_source").get();
      const prevAt = Number(prev.data()?.updatedAtMs) || 0;
      summaryDue = !prev.exists || now - prevAt >= SUMMARY_MIN_INTERVAL_MS;
    } catch {
      summaryDue = true;
    }
  }

  if (summaryDue) {
    const done = await adminDb.collection(PRED).where("scored", "==", true).limit(400).get();
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

    // Ringkasan ML (dokumen lama) hanya dari source "ml"/tanpa source.
    const mlItems = done.docs
      .map((d) => d.data())
      .filter((d) => !d.expired && d.actual && (d.source ?? "ml") === "ml")
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, MAX_SUMMARY_DOCS)
      .map<ScoredPrediction>((d) => ({
        predicted: d.label,
        actual: d.actual,
        confidence: d.confidence,
        futureReturn: d.futureReturn,
      }));
    summary = summarize(mlItems);
    await adminDb
      .collection(SCORES)
      .doc("summary")
      .set({ ...summary, updatedAtMs: now });

    // Ringkasan per sumber (ML + tiap LLM + konsensus) untuk dibandingkan.
    const grouped = new Map<string, ScoredPrediction[]>();
    for (const d of done.docs.map((x) => x.data())) {
      if (d.expired || !d.actual) continue;
      const src = d.source ?? "ml";
      const arr = grouped.get(src) ?? [];
      if (arr.length < MAX_SUMMARY_DOCS) {
        arr.push({
          predicted: d.label,
          actual: d.actual,
          confidence: d.confidence,
          futureReturn: d.futureReturn,
        });
        grouped.set(src, arr);
      }
    }
    bySource = {};
    for (const [src, arr] of grouped) bySource[src] = summarize(arr);
    await adminDb
      .collection(SCORES)
      .doc("by_source")
      .set({ sources: bySource, updatedAtMs: now });
  }

  return { checked: due.length, scored, expired, summary, bySource };
}

/** Baca ringkasan terbaru (untuk endpoint/halaman). */
export async function getShadowSummaries(): Promise<{
  ml: (ShadowSummary & { updatedAtMs?: number }) | null;
  bySource: Record<string, ShadowSummary>;
  updatedAtMs: number | null;
}> {
  const [ml, by] = await Promise.all([
    adminDb.collection(SCORES).doc("summary").get(),
    adminDb.collection(SCORES).doc("by_source").get(),
  ]);
  const byData = by.exists ? (by.data() as { sources?: Record<string, ShadowSummary>; updatedAtMs?: number }) : null;
  return {
    ml: ml.exists ? (ml.data() as ShadowSummary & { updatedAtMs?: number }) : null,
    bySource: byData?.sources ?? {},
    updatedAtMs: byData?.updatedAtMs ?? null,
  };
}
