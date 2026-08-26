/**
==========================================================
AURA Trade OS
ML Model Store (Admin SDK, server-only)
Version : 0.1.2 Alpha

Perubahan dari 0.1.1: Firestore MENOLAK array yang langsung
berisi array lagi (nested array) -- error persis:
"3 INVALID_ARGUMENT: Property ... contains an invalid nested
entity." Bukan cuma validationMetrics.confusionMatrix (sudah
diperbaiki di 0.1.1) -- weights.weights (TrainedModelWeights,
weights[k][j] = bobot fitur j untuk kelas k, softmax multi-
class) JUGA number[][] dan kena masalah yang sama. Sekarang
KEDUA field dikonversi ke array objek ({row: number[]}[])
sebelum ditulis, dikonversi balik saat dibaca -- kontrak di
luar file ini (train.ts, predict.ts, ml-lab.tsx) tetap sama
persis, tetap terima number[][] apa adanya.

InMemoryRepository (storage/repository.ts) tidak cukup untuk
model ML nyata: training (POST /api/ml/train) dan prediksi
(GET /api/ml/predict) berjalan di invocation serverless yang
BERBEDA - memory tidak dipertahankan di antara keduanya. Model
yang sudah dilatih harus disimpan di tempat persisten.

Pola sama seperti services/firebase/botState.ts - Admin SDK,
server-only, TIDAK ada komponen client yang boleh mengimpor
file ini langsung.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { TrainedModelWeights, EvaluationMetrics, TrainingAlgorithm } from "../models/trainer";

const COLLECTION = "ml_models";
const ACTIVE_DOC_ID = "active";

export interface StoredModel {
  id: string;
  algorithm: TrainingAlgorithm;
  pairs: string[];
  resolution: string;
  trainedSamples: number;
  validationSamples: number;
  epochs: number;
  finalTrainLoss: number;
  validationMetrics: EvaluationMetrics;
  weights: TrainedModelWeights;
  trainedAt: string;
}

/**
 * Helper generik: number[][] <-> {row: number[]}[]. Array yang
 * berisi OBJEK (yang masing-masing punya array di dalamnya) itu
 * diizinkan Firestore -- yang dilarang cuma array LANGSUNG berisi
 * array.
 */
function matrixToRows(matrix: number[][]): { row: number[] }[] {
  return matrix.map((row) => ({ row }));
}

function rowsToMatrix(rows: { row: number[] }[]): number[][] {
  return rows.map((entry) => entry.row);
}

/**
 * Bentuk validationMetrics & weights SETELAH matriks number[][]
 * diserialisasi jadi array objek -- ini yang benar-benar ditulis/
 * dibaca dari Firestore, TIDAK diekspor keluar file ini.
 */
interface FirestoreSafeMetrics extends Omit<EvaluationMetrics, "confusionMatrix"> {
  confusionMatrix: { row: number[] }[];
}

interface FirestoreSafeWeights extends Omit<TrainedModelWeights, "weights"> {
  weights: { row: number[] }[];
}

interface FirestoreSafeModel extends Omit<StoredModel, "validationMetrics" | "weights"> {
  validationMetrics: FirestoreSafeMetrics;
  weights: FirestoreSafeWeights;
}

function serializeMetrics(metrics: EvaluationMetrics): FirestoreSafeMetrics {
  return {
    ...metrics,
    confusionMatrix: matrixToRows(metrics.confusionMatrix),
  };
}

function deserializeMetrics(metrics: FirestoreSafeMetrics): EvaluationMetrics {
  return {
    ...metrics,
    confusionMatrix: rowsToMatrix(metrics.confusionMatrix),
  };
}

function serializeWeights(weights: TrainedModelWeights): FirestoreSafeWeights {
  return {
    ...weights,
    weights: matrixToRows(weights.weights),
  };
}

function deserializeWeights(weights: FirestoreSafeWeights): TrainedModelWeights {
  return {
    ...weights,
    weights: rowsToMatrix(weights.weights),
  };
}

function serializeModel(model: StoredModel): FirestoreSafeModel {
  return {
    ...model,
    validationMetrics: serializeMetrics(model.validationMetrics),
    weights: serializeWeights(model.weights),
  };
}

function deserializeModel(model: FirestoreSafeModel): StoredModel {
  return {
    ...model,
    validationMetrics: deserializeMetrics(model.validationMetrics),
    weights: deserializeWeights(model.weights),
  };
}

function modelsCollection() {
  return adminDb.collection(COLLECTION);
}

/**
 * Simpan model sebagai model AKTIF (dipakai predictor.ts) sekaligus
 * arsip berdasarkan timestamp (untuk histori evaluasi/perbandingan).
 */
export async function saveActiveModel(model: StoredModel): Promise<void> {

  const safeModel = serializeModel(model);

  await modelsCollection().doc(ACTIVE_DOC_ID).set(safeModel, { merge: false });

  await modelsCollection()
    .doc(`history_${model.id}`)
    .set({ ...safeModel, archivedAt: FieldValue.serverTimestamp() });
}

/**
 * Ambil model AKTIF saat ini (dipakai untuk inference). null kalau
 * belum pernah ada training sukses sama sekali.
 */
export async function getActiveModel(): Promise<StoredModel | null> {
  const snapshot = await modelsCollection().doc(ACTIVE_DOC_ID).get();

  if (!snapshot.exists) {
    return null;
  }

  return deserializeModel(snapshot.data() as FirestoreSafeModel);
}

/**
 * Ambil riwayat training (untuk melihat apakah model membaik/memburuk
 * antar training run) - diurutkan terbaru dulu, dibatasi supaya tidak
 * menarik dokumen tak terbatas.
 */
export async function getModelHistory(limit = 20): Promise<StoredModel[]> {
  const snapshot = await modelsCollection().orderBy("trainedAt", "desc").limit(limit + 1).get();

  return snapshot.docs
    .map((doc) => doc.data() as FirestoreSafeModel)
    .filter((d) => d.trainedAt)
    .slice(0, limit)
    .map(deserializeModel);
}

export default { saveActiveModel, getActiveModel, getModelHistory };
