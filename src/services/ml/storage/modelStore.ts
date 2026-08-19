/**
==========================================================
AURA Trade OS
ML Model Store (Admin SDK, server-only)
Version : 0.1.0 Alpha

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

function modelsCollection() {
  return adminDb.collection(COLLECTION);
}

/**
 * Simpan model sebagai model AKTIF (dipakai predictor.ts) sekaligus
 * arsip berdasarkan timestamp (untuk histori evaluasi/perbandingan).
 */
export async function saveActiveModel(model: StoredModel): Promise<void> {
  await modelsCollection().doc(ACTIVE_DOC_ID).set(model, { merge: false });

  await modelsCollection()
    .doc(`history_${model.id}`)
    .set({ ...model, archivedAt: FieldValue.serverTimestamp() });
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

  return snapshot.data() as StoredModel;
}

/**
 * Ambil riwayat training (untuk melihat apakah model membaik/memburuk
 * antar training run) - diurutkan terbaru dulu, dibatasi supaya tidak
 * menarik dokumen tak terbatas.
 */
export async function getModelHistory(limit = 20): Promise<StoredModel[]> {
  const snapshot = await modelsCollection().orderBy("trainedAt", "desc").limit(limit + 1).get();

  return snapshot.docs
    .map((doc) => doc.data() as StoredModel)
    .filter((d) => d.trainedAt)
    .slice(0, limit);
}

export default { saveActiveModel, getActiveModel, getModelHistory };
