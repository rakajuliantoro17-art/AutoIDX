/**
==========================================================
AURA Trade OS
ML Training API
Version : 0.1.0 Alpha

POST /api/ml/train  (WAJIB login - Firebase ID Token)
Body (semua opsional):
  {
    "pairs": ["btc_idr","eth_idr","sol_idr"],   // default: 5 pair paling likuid
    "resolution": "60",                          // default candle 1 jam
    "candleLimit": 500,                           // default 500 candle/pair
    "epochs": 300,
    "futureWindow": 10,        // berapa candle ke depan untuk label
    "profitThreshold": 2,      // % kenaikan minimal supaya dilabel BUY
    "lossThreshold": -2        // % penurunan minimal supaya dilabel SELL
  }

Proses ini NYATA menarik data historis dari Indodax dan
melatih model - bisa makan waktu (puluhan detik) tergantung
jumlah pair & candle. Bukan operasi ringan, jangan dipanggil
di setiap page load.

Hasil training TIDAK otomatis disambungkan ke live trading.
Cuma disimpan sebagai "model aktif" untuk keperluan evaluasi
lewat GET /api/ml/predict. Menyambungkan ke eksekusi order
adalah keputusan terpisah (lihat docs/claude.md, "Audit
Detail: AI/ML Layer").
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { checkRateLimit } from "@/services/security/rateLimitStore";
import { collectDataset } from "@/services/ml/dataset/collector";
import modelTrainer from "@/services/ml/models/trainer";
import { saveActiveModel } from "@/services/ml/storage/modelStore";

const DEFAULT_PAIRS = ["btc_idr", "eth_idr", "sol_idr", "usdt_idr", "xrp_idr"];

// Training = beberapa request ke Indodax (candle historis) + tulis
// Firestore + komputasi gradient descent - jelas bukan operasi
// ringan, dibatasi 5x/10 menit per user (bukan global, supaya satu
// user yang training berkali-kali tidak mengunci user lain).
const TRAIN_RATE_LIMIT = 5;
const TRAIN_RATE_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyApiAuth(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized - login diperlukan" });
  }

  const rateLimit = await checkRateLimit(`ml_train:${user.uid}`, TRAIN_RATE_LIMIT, TRAIN_RATE_WINDOW_MS);

  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
    return res.status(429).json({
      error: `Terlalu sering training (maks ${TRAIN_RATE_LIMIT}x per 10 menit). Coba lagi setelah ${new Date(rateLimit.resetAt).toLocaleTimeString("id-ID")}.`,
    });
  }

  const body = req.body ?? {};

  const pairs: string[] = Array.isArray(body.pairs) && body.pairs.length > 0 ? body.pairs : DEFAULT_PAIRS;
  const resolution: string = body.resolution ?? "60";
  const candleLimit: number = Number(body.candleLimit) || 500;
  const epochs: number = Number(body.epochs) || 300;
  const futureWindow: number = Number(body.futureWindow) || 10;
  const profitThreshold: number = Number(body.profitThreshold) || 2;
  const lossThreshold: number = Number(body.lossThreshold) || -2;

  try {
    // 1. Ambil data historis ASLI + hitung fitur teknikal
    const { features, failedPairs } = await collectDataset({
      pairs,
      resolution,
      candleLimit,
    });

    if (features.length < 100) {
      return res.status(422).json({
        error: `Dataset terlalu kecil (${features.length} sample) untuk training yang layak. ` +
          `Coba tambah candleLimit atau jumlah pair.`,
        failedPairs,
      });
    }

    // 2. Label tiap sample berdasar pergerakan harga N candle ke depan.
    // Instance baru (bukan singleton default) supaya threshold dari
    // body request benar-benar dipakai, bukan default constructor.
    const { DatasetBuilder } = await import("@/services/ml/dataset/builder");
    const builder = new DatasetBuilder({ futureWindow, profitThreshold, lossThreshold });
    const built = builder.build(features);

    // 3. Latih model logistic regression sungguhan + evaluasi di validation split
    const trainingResult = await modelTrainer.train(built.samples, { epochs });

    // 4. Simpan sebagai model aktif (persisten - Firestore)
    const modelId = `lr_${Date.now()}`;

    await saveActiveModel({
      id: modelId,
      algorithm: trainingResult.algorithm,
      pairs,
      resolution,
      trainedSamples: trainingResult.trainedSamples,
      validationSamples: trainingResult.validationSamples,
      epochs: trainingResult.epochs,
      finalTrainLoss: trainingResult.finalTrainLoss,
      validationMetrics: trainingResult.validationMetrics,
      weights: trainingResult.modelWeights,
      trainedAt: trainingResult.finishedAt,
    });

    return res.status(200).json({
      success: true,
      modelId,
      datasetSize: features.length,
      labeledSamples: built.total,
      failedPairs,
      trainedSamples: trainingResult.trainedSamples,
      validationSamples: trainingResult.validationSamples,
      durationMs: trainingResult.durationMs,
      finalTrainLoss: trainingResult.finalTrainLoss,
      validationMetrics: trainingResult.validationMetrics,
    });
  } catch (error: any) {
    console.error("[ML Train API]", error);
    return res.status(500).json({ error: error.message || "Training failed" });
  }
}
