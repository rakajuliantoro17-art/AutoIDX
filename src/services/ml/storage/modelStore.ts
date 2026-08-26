/**
==========================================================
AURA Trade OS
ML Model Store (Admin SDK, server-only)
Version : 0.1.1 Alpha

Perubahan dari 0.1.0: Firestore MENOLAK array yang langsung
berisi array lagi (nested array) -- error persis:
"3 INVALID_ARGUMENT: Property validationMetrics contains an
invalid nested entity." EvaluationMetrics.confusionMatrix
bertipe number[][] (matriks konfusi, array baris berisi array
angka), jadi gagal ditulis apa adanya. Sekarang dikonversi ke
array objek ({row: number[]}[]) sebelum ditulis -- array
BERISI OBJEK yang masing-masing punya array di dalamnya itu
diizinkan Firestore, beda dengan array langsung berisi array.
Dikonversi balik ke number[][] saat dibaca, supaya bentuk yang
dilihat pemanggil (train.ts, predict.ts, ml-lab.tsx) tetap sama
seperti sebelumnya -- TIDAK ADA perubahan kontrak di luar file
ini.

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
 * Bentuk validationMetrics SETELAH confusionMatrix diserialisasi
 * jadi array objek -- ini yang benar-benar ditulis/dibaca dari
 * Firestore, TIDAK diekspor keluar file ini.
 */
interface FirestoreSafeMetrics extends Omit<EvaluationMetrics, "confusionMatrix"> {
  confusionMatrix: { row: number[] }[];
}

interface FirestoreSafeModel extends Omit<StoredModel, "validationMetrics"> {
  validationMetrics: FirestoreSafeMetrics;
}

function serializeMetrics(metrics: EvaluationMetrics): FirestoreSafeMetrics {
  return {
    ...metrics,
    confusionMatrix: metrics.confusionMatrix.map((row) => ({ row })),
  };
}

function deserializeMetrics(metrics: FirestoreSafeMetrics): EvaluationMetrics {
  return {
    ...metrics,
    confusionMatrix: metrics.confusionMatrix.map((entry) => entry.row),
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

  const safeModel: FirestoreSafeModel = {
    ...model,
    validationMetrics: serializeMetrics(model.validationMetrics),
  };

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

  const data = snapshot.data() as FirestoreSafeModel;

  return {
    ...data,
    validationMetrics: deserializeMetrics(data.validationMetrics),
  };
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
    .map((d) => ({
      ...d,
      validationMetrics: deserializeMetrics(d.validationMetrics),
    }));
}

export default { saveActiveModel, getActiveModel, getModelHistory };
