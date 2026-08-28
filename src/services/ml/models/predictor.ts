/**
==========================================================
AURA Trade OS
ML Model Predictor
Version : 0.3.0 Alpha

Perubahan dari 0.2.0: cabang inverse-transform sesuai
`weights.scalingMethod` (STANDARD/MIN_MAX) alih-alih selalu
z-score. Model lama di Firestore yang belum punya field
scalingMethod (dilatih sebelum trainer.ts 0.3.0) DEFAULT ke
STANDARD - rumus IDENTIK dengan versi sebelumnya, jadi tidak
perlu dilatih ulang paksa.

GANTI TOTAL dari versi sebelumnya (komentarnya sendiri jujur:
"Placeholder inference... akan diganti dengan adapter
TensorFlow/XGBoost/ONNX/Ensemble" - belum pernah diganti).

Sekarang benar-benar menjalankan inference dari model yang
dilatih trainer.ts (logistic regression, softmax) dan
disimpan di Firestore lewat storage/modelStore.ts.

PENTING: modul ini HANYA memberi prediksi + confidence.
TIDAK terhubung ke eksekusi order (services/execution,
services/liveTrading) di versi ini - itu keputusan terpisah
yang didokumentasikan di docs/claude.md, "Audit Detail:
AI/ML Layer", untuk didiskusikan dulu sebelum disambungkan
ke uang asli.
==========================================================
*/

import { PredictionLabel } from "../types";
import { getActiveModel, StoredModel } from "../storage/modelStore";

export interface PredictionInput {
  /**
   * Fitur MENTAH (belum dinormalisasi) - key HARUS cocok dengan
   * featureOrder yang dipakai saat training (lihat
   * dataset/collector.ts untuk daftar key yang dihasilkan).
   */
  features: Record<string, number>;
}

export interface PredictionResult {
  label: PredictionLabel;
  confidence: number;
  probabilities: Partial<Record<PredictionLabel, number>>;
  modelId: string;
  modelTrainedAt: string;
  modelValidationAccuracy: number;
  durationMs: number;
  timestamp: Date;
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / (sum || 1));
}

export class ModelPredictor {
  /**
   * Cache model aktif di memory (masih valid selama satu warm
   * invocation serverless) supaya tidak query Firestore di setiap
   * pemanggilan predict() kalau dipanggil berkali-kali berurutan.
   */
  private cachedModel: StoredModel | null = null;
  private cachedAt = 0;
  private readonly CACHE_TTL_MS = 60_000;

  private async loadModel(): Promise<StoredModel> {
    const now = Date.now();

    if (this.cachedModel && now - this.cachedAt < this.CACHE_TTL_MS) {
      return this.cachedModel;
    }

    const model = await getActiveModel();

    if (!model) {
      throw new Error(
        "Belum ada model ML yang terlatih. Jalankan training dulu lewat POST /api/ml/train."
      );
    }

    this.cachedModel = model;
    this.cachedAt = now;

    return model;
  }

  async predict(input: PredictionInput): Promise<PredictionResult> {
    const started = performance.now();

    const model = await this.loadModel();
    const { weights: w } = model;

    const x = w.featureOrder.map((key) => {
      const raw = input.features[key];

      if (raw === undefined) {
        console.warn(
          `[ModelPredictor] Fitur "${key}" tidak ada di input, dianggap 0. ` +
            `Cek apakah dataset/collector.ts berubah tapi model belum dilatih ulang.`
        );
      }

      return raw ?? 0;
    });

    // Model lama (dilatih sebelum field scalingMethod ada) tidak punya
    // field ini sama sekali di Firestore -> default STANDARD, SAMA
    // dengan satu-satunya rumus yang pernah dipakai sebelumnya. Ini
    // membuat model lama tetap bisa dipakai tanpa perlu dilatih ulang
    // paksa cuma karena field baru ditambahkan.
    const scalingMethod = w.scalingMethod ?? "STANDARD";

    const normalizedX =
      scalingMethod === "MIN_MAX"
        ? x.map((v, j) => {
            const min = w.featureMin?.[j] ?? 0;
            const max = w.featureMax?.[j] ?? 1;
            return max === min ? 0 : (v - min) / (max - min);
          })
        : x.map((v, j) => (v - w.featureMean[j]) / (w.featureStd[j] || 1));

    const logits = w.weights.map(
      (wk, k) => wk.reduce((s, wj, j) => s + wj * normalizedX[j], 0) + w.bias[k]
    );

    const probs = softmax(logits);

    const bestIndex = probs.indexOf(Math.max(...probs));
    const label = w.classes[bestIndex];

    const probabilities: Partial<Record<PredictionLabel, number>> = {};
    w.classes.forEach((c, i) => {
      probabilities[c] = probs[i];
    });

    return {
      label,
      confidence: probs[bestIndex],
      probabilities,
      modelId: model.id,
      modelTrainedAt: model.trainedAt,
      modelValidationAccuracy: model.validationMetrics.accuracy,
      durationMs: performance.now() - started,
      timestamp: new Date(),
    };
  }
}

const modelPredictor = new ModelPredictor();
export default modelPredictor;
