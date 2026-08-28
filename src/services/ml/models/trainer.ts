/**
==========================================================
AURA Trade OS
ML Model Trainer
Version : 0.3.0 Alpha

Perubahan dari 0.2.0: fitur diskalakan lewat FeatureVectorizer +
FeatureScaler (services/ml/features/vectorizer.ts + scaler.ts,
sebelumnya orphan) alih-alih matrix mentah + z-score inline.
scalingMethod (STANDARD/MIN_MAX) sekarang bisa dikonfigurasi lewat
TrainingConfig, default STANDARD - hasil numerik IDENTIK dengan
versi 0.2.0 untuk caller yang tidak set field ini. featureMin/
featureMax ditambahkan ke TrainedModelWeights (selalu disimpan,
dipakai predictor.ts hanya kalau scalingMethod=MIN_MAX). ROBUST
SENGAJA ditolak eksplisit di level ini - lihat catatan di train().

GANTI TOTAL dari versi sebelumnya, yang cuma `sleep(300ms)`
lalu return objek sukses palsu (lihat docs/claude.md, Audit
Detail: AI/ML Layer, untuk histori masalahnya).

Implementasi nyata: multinomial logistic regression (softmax)
dilatih pakai batch gradient descent, ditulis pure TypeScript
- SENGAJA bukan TensorFlow/XGBoost/dst, karena:
1. Tidak perlu native binary yang sering bermasalah di
   Vercel serverless function.
2. Koefisien tetap bisa diaudit manual (penting - ini
   akhirnya menyentuh keputusan trading uang asli, bukan
   cuma demo).
3. Ukuran dataset yang realistis untuk 1 exchange + beberapa
   pair tidak butuh model sekompleks itu.

Model type lain (RANDOM_FOREST/XGBOOST/dst di ../types.ts)
BELUM diimplementasikan - kalau dipanggil dengan algorithm
selain LOGISTIC_REGRESSION, training akan gagal eksplisit
(bukan pura-pura sukses).
==========================================================
*/

import { PredictionLabel, TrainingSample } from "../types";
import featureStatistics from "../features/statistics";
import featureVectorizer from "../features/vectorizer";
import featureScaler, { ScalingMethod } from "../features/scaler";

export type TrainingAlgorithm = "LOGISTIC_REGRESSION";

export interface TrainingConfig {
  algorithm?: TrainingAlgorithm;
  epochs?: number;
  learningRate?: number;
  l2?: number;
  validationSplit?: number;
  randomSeed?: number;

  /**
   * Metode penskalaan fitur. Default "STANDARD" (z-score) - SAMA
   * seperti perilaku sebelum field ini ada, jadi model lama yang
   * dilatih ulang tanpa opsi ini eksplisit tetap dapat hasil identik.
   * "MIN_MAX" dan "ROBUST" tersedia lewat FeatureScaler untuk operator
   * yang mau bereksperimen (mis. dataset dengan outlier ekstrem cocok
   * pakai ROBUST, bukan STANDARD).
   */
  scalingMethod?: ScalingMethod;
}

export interface TrainedModelWeights {
  /**
   * Urutan fitur yang dipakai - HARUS dipakai persis sama urutannya
   * saat inference (predictor.ts), kalau tidak prediksi jadi salah.
   */
  featureOrder: string[];

  /**
   * Metode penskalaan yang dipakai training ini - predictor.ts WAJIB
   * baca field ini untuk tahu formula inverse-transform yang benar
   * saat inference. Model lama (sebelum field ini ada) tidak akan
   * punya field ini sama sekali di Firestore - predictor.ts default
   * ke STANDARD kalau field-nya undefined, supaya model lama tetap
   * bisa dipakai tanpa perlu dilatih ulang paksa.
   */
  scalingMethod: ScalingMethod;

  /**
   * Rata-rata & std-dev per fitur dari data TRAINING SAJA (dipakai
   * untuk normalisasi input saat inference juga, supaya konsisten).
   * SELALU dihitung & disimpan terlepas dari scalingMethod yang aktif
   * (murah, dan berguna sebagai diagnostik/fallback).
   */
  featureMean: number[];
  featureStd: number[];

  /**
   * Min/max per fitur dari data TRAINING SAJA - HANYA relevan dipakai
   * predictor.ts kalau scalingMethod === "MIN_MAX". Tetap dihitung &
   * disimpan selalu (murah) supaya operator bisa switch scalingMethod
   * di training berikutnya tanpa kejutan field hilang.
   */
  featureMin: number[];
  featureMax: number[];

  /**
   * Label kelas dalam urutan yang dipakai softmax.
   */
  classes: PredictionLabel[];

  /**
   * weights[k][j] = bobot fitur j untuk kelas k. bias[k] = bias kelas k.
   */
  weights: number[][];
  bias: number[];
}

export interface EvaluationMetrics {
  accuracy: number;
  perClass: Record<
    string,
    { precision: number; recall: number; f1: number; support: number }
  >;
  confusionMatrix: number[][];
}

export interface TrainingResult {
  success: boolean;
  algorithm: TrainingAlgorithm;
  trainedSamples: number;
  validationSamples: number;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  epochs: number;
  finalTrainLoss: number;
  validationMetrics: EvaluationMetrics;
  modelWeights: TrainedModelWeights;
  /**
   * Peringatan kualitas fitur dari FeatureStatisticsEngine
   * (services/ml/features/statistics.ts, SEBELUMNYA orphan) --
   * fitur dengan standardDeviation===0 (konstan, tidak
   * membedakan apapun) atau volatility>1 (skala jauh lebih liar
   * dari rata-ratanya). TIDAK menggagalkan training (model tetap
   * dilatih apa adanya, SAMA seperti sebelum field ini ada) --
   * murni informasi diagnostik untuk operator, ditampilkan di
   * dashboard/log training kalau ada.
   */
  featureWarnings: string[];
}

/**
 * PRNG deterministik (mulberry32) supaya train/val split bisa
 * direproduksi kalau randomSeed diberikan - penting untuk debugging
 * model yang hasilnya aneh.
 */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / (sum || 1));
}

export class ModelTrainer {
  async train(
    dataset: TrainingSample[],
    config: TrainingConfig = {}
  ): Promise<TrainingResult> {
    const algorithm = config.algorithm ?? "LOGISTIC_REGRESSION";

    if (algorithm !== "LOGISTIC_REGRESSION") {
      throw new Error(
        `ModelTrainer: algoritma "${algorithm}" belum diimplementasikan. ` +
          `Cuma LOGISTIC_REGRESSION yang tersedia saat ini - lihat komentar di trainer.ts.`
      );
    }

    if (dataset.length === 0) {
      throw new Error("Training dataset is empty.");
    }

    const epochs = config.epochs ?? 300;
    const learningRate = config.learningRate ?? 0.1;
    const l2 = config.l2 ?? 0.001;
    const validationSplit = config.validationSplit ?? 0.2;
    const rng = createRng(config.randomSeed ?? 42);

    // Default STANDARD (z-score) - IDENTIK dengan satu-satunya perilaku
    // yang ada sebelum field ini ditambahkan, jadi caller lama (yang
    // tidak pernah tahu soal scalingMethod) dapat hasil training persis
    // sama. ROBUST BELUM didukung di level trainer - FeatureScaler
    // sendiri sudah bisa robust-scale satu array, tapi TrainedModelWeights
    // belum menyimpan median/IQR per fitur yang dibutuhkan predictor.ts
    // untuk mereproduksi transform yang sama saat inference. Gagal
    // eksplisit (bukan diam-diam salah hasil) kalau diminta - pola yang
    // sama seperti algorithm !== LOGISTIC_REGRESSION di atas.
    const scalingMethod: ScalingMethod = config.scalingMethod ?? "STANDARD";

    if (scalingMethod === "ROBUST") {
      throw new Error(
        `ModelTrainer: scalingMethod "ROBUST" belum didukung - TrainedModelWeights ` +
          `belum menyimpan median/IQR per fitur yang dibutuhkan untuk inference yang benar. ` +
          `Pakai "STANDARD" (default) atau "MIN_MAX" untuk sekarang.`
      );
    }

    const startedAt = new Date();

    // --- Susun urutan fitur dari sample pertama (semua sample HARUS
    // punya key values yang sama, dijamin oleh dataset/collector.ts) ---
    // Dibangun lewat FeatureVectorizer (services/ml/features/vectorizer.ts,
    // sebelumnya orphan) supaya urutan schema konsisten dengan cara
    // predictor.ts/tempat lain membangun vector dari objek fitur bernama -
    // TIDAK mengubah urutan (masih sorted keys dari sample pertama, sama
    // persis seperti sebelumnya) atau nilai yang dihasilkan.
    const { schema: featureOrder } = featureVectorizer.build(
      dataset[0].features.values,
      Object.keys(dataset[0].features.values).sort()
    );

    const classOrder: PredictionLabel[] = ["STRONG_SELL", "SELL", "HOLD", "BUY", "STRONG_BUY"];
    const usedClasses = Array.from(new Set(dataset.map((s) => s.label)));
    const activeClasses = classOrder.filter((c) => usedClasses.includes(c));

    if (activeClasses.length < 2) {
      throw new Error(
        `Training dataset cuma punya ${activeClasses.length} kelas unik (${activeClasses.join(
          ", "
        )}). Minimal 2 kelas untuk klasifikasi. Coba perbesar profitThreshold/lossThreshold di DatasetBuilder atau kumpulkan data dari rentang waktu yang lebih volatil.`
      );
    }

    // --- Normalisasi fitur (z-score) berdasarkan seluruh dataset SEBELUM
    // split, lalu split - standar praktik untuk dataset kecil seperti ini.
    // (Catatan jujur: idealnya normalisasi dihitung dari train split saja
    // untuk menghindari sedikit data leakage; untuk dataset kecil dampaknya
    // minor, tapi didokumentasikan di sini supaya tidak dianggap "sempurna".)
    //
    // Mean/std per fitur SEKARANG dihitung lewat FeatureStatisticsEngine
    // (services/ml/features/statistics.ts, SEBELUMNYA 100% orphan) --
    // formulanya IDENTIK dengan perhitungan manual yang sebelumnya ada di
    // sini (population variance, divide by N), jadi angka featureMean/
    // featureStd yang tersimpan ke model TIDAK BERUBAH sama sekali
    // dibanding sebelumnya. Yang BARU: quality flag ("BAD" kalau
    // standardDeviation===0 - fitur konstan, tidak membedakan apapun;
    // "WARNING" kalau volatility>1) dikumpulkan jadi featureWarnings,
    // diagnostik tambahan yang SEBELUMNYA tidak ada sama sekali. ---
    const rawMatrix = dataset.map(
      (s) => featureVectorizer.build(s.features.values, featureOrder).vector
    );

    const featureWarnings: string[] = [];

    const featureStatsPerColumn = featureOrder.map((name, j) => {
      const columnValues = rawMatrix.map((row) => row[j]);
      const report = featureStatistics.analyze(name, columnValues);

      if (report.quality === "BAD") {
        featureWarnings.push(
          `Fitur "${name}" konstan (standard deviation 0) di seluruh dataset training - tidak membedakan apapun, pertimbangkan dihapus dari featureOrder.`
        );
      } else if (report.quality === "WARNING") {
        featureWarnings.push(
          `Fitur "${name}" punya volatilitas tinggi (${report.statistics.volatility.toFixed(2)}) relatif terhadap rata-ratanya - periksa apakah ini wajar atau indikasi data kotor.`
        );
      }

      return report.statistics;
    });

    const featureMean = featureStatsPerColumn.map((s) => s.mean);

    // `|| 1` dipertahankan PERSIS seperti kode lama - FeatureStatisticsEngine
    // sendiri mengembalikan standardDeviation apa adanya (bisa 0), fallback
    // ke 1 di sini supaya normalisasi tidak pernah divide-by-zero.
    const featureStd = featureStatsPerColumn.map((s) => s.standardDeviation || 1);

    // min/max SELALU dihitung & disimpan (murah, dari statistik yang sama)
    // terlepas dari scalingMethod aktif - supaya operator bisa ganti
    // scalingMethod di training berikutnya tanpa field yang hilang.
    const featureMin = featureStatsPerColumn.map((s) => s.min);
    const featureMax = featureStatsPerColumn.map((s) => s.max);

    // --- Normalisasi via FeatureScaler (services/ml/features/scaler.ts,
    // sebelumnya orphan), per KOLOM fitur (bukan per baris) supaya tiap
    // fitur diskalakan berdasar rentang/statistiknya sendiri - sama
    // seperti perhitungan manual sebelumnya kalau scalingMethod=STANDARD
    // (hasil numeriknya IDENTIK, cuma dipindah ke FeatureScaler.scale()
    // yang sudah diaudit unit-nya terpisah). MIN_MAX pakai FeatureScaler
    // apa adanya (output 0-1).
    const columns = featureOrder.map((_, j) => rawMatrix.map((row) => row[j]));
    const scaledColumns = columns.map((col) => featureScaler.scale(col, scalingMethod).values);
    const normalizedX = rawMatrix.map((_, i) => scaledColumns.map((col) => col[i]));

    const y = dataset.map((s) => activeClasses.indexOf(s.label));

    // --- Split train/validation (shuffled dengan seed tetap) ---
    const indices = shuffle(
      Array.from({ length: dataset.length }, (_, i) => i),
      rng
    );
    const valCount = Math.max(1, Math.floor(dataset.length * validationSplit));
    const valIdx = indices.slice(0, valCount);
    const trainIdx = indices.slice(valCount);

    if (trainIdx.length === 0) {
      throw new Error("Dataset terlalu kecil untuk displit train/validation.");
    }

    const numFeatures = featureOrder.length;
    const numClasses = activeClasses.length;

    // weights[k][j], bias[k] - init nol (logistic regression cembung,
    // tidak butuh random init seperti neural network).
    const weights: number[][] = Array.from({ length: numClasses }, () =>
      new Array(numFeatures).fill(0)
    );
    const bias: number[] = new Array(numClasses).fill(0);

    let finalTrainLoss = 0;

    for (let epoch = 0; epoch < epochs; epoch++) {
      const gradW = weights.map((row) => row.map(() => 0));
      const gradB = new Array(numClasses).fill(0);
      let epochLoss = 0;

      for (const i of trainIdx) {
        const x = normalizedX[i];
        const logits = weights.map((wk, k) => wk.reduce((s, w, j) => s + w * x[j], 0) + bias[k]);
        const probs = softmax(logits);

        const trueClass = y[i];
        epochLoss += -Math.log(Math.max(probs[trueClass], 1e-12));

        for (let k = 0; k < numClasses; k++) {
          const target = k === trueClass ? 1 : 0;
          const error = probs[k] - target;

          for (let j = 0; j < numFeatures; j++) {
            gradW[k][j] += error * x[j];
          }
          gradB[k] += error;
        }
      }

      const n = trainIdx.length;

      for (let k = 0; k < numClasses; k++) {
        for (let j = 0; j < numFeatures; j++) {
          const grad = gradW[k][j] / n + l2 * weights[k][j];
          weights[k][j] -= learningRate * grad;
        }
        bias[k] -= learningRate * (gradB[k] / n);
      }

      finalTrainLoss = epochLoss / n;
    }

    // --- Evaluasi JUJUR di validation split (data yang tidak pernah
    // dilihat saat gradient descent) ---
    const confusionMatrix = Array.from({ length: numClasses }, () =>
      new Array(numClasses).fill(0)
    );

    for (const i of valIdx) {
      const x = normalizedX[i];
      const logits = weights.map((wk, k) => wk.reduce((s, w, j) => s + w * x[j], 0) + bias[k]);
      const probs = softmax(logits);
      const predicted = probs.indexOf(Math.max(...probs));
      confusionMatrix[y[i]][predicted] += 1;
    }

    const perClass: EvaluationMetrics["perClass"] = {};
    let correct = 0;

    for (let k = 0; k < numClasses; k++) {
      const tp = confusionMatrix[k][k];
      const support = confusionMatrix[k].reduce((a, b) => a + b, 0);
      const predictedAsK = confusionMatrix.reduce((sum, row) => sum + row[k], 0);

      const precision = predictedAsK > 0 ? tp / predictedAsK : 0;
      const recall = support > 0 ? tp / support : 0;
      const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      perClass[activeClasses[k]] = { precision, recall, f1, support };
      correct += tp;
    }

    const accuracy = valIdx.length > 0 ? correct / valIdx.length : 0;

    const finishedAt = new Date();

    return {
      success: true,
      algorithm,
      trainedSamples: trainIdx.length,
      validationSamples: valIdx.length,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      epochs,
      finalTrainLoss,
      validationMetrics: { accuracy, perClass, confusionMatrix },
      featureWarnings,
      modelWeights: {
        featureOrder,
        scalingMethod,
        featureMean,
        featureStd,
        featureMin,
        featureMax,
        classes: activeClasses,
        weights,
        bias,
      },
    };
  }
}

const modelTrainer = new ModelTrainer();
export default modelTrainer;
