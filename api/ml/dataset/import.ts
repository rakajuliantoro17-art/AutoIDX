/**
==========================================================
AURA Trade OS
ML Dataset Import API
Version : 0.1.0 Alpha

POST /api/ml/dataset/import (WAJIB login - Firebase ID Token)
Body:
  {
    "content": "...",           // isi file JSON/CSV (string)
    "format": "JSON" | "CSV",
    "trainAfterImport": false,  // kalau true, langsung latih model dari dataset ini
    "epochs": 300,
    "balance": true
  }

CATATAN PENTING soal format CSV: exporter.ts (lihat
dataset/exporter.ts toCSV()) HANYA menulis kolom
timestamp/symbol/timeframe/label - TIDAK menyertakan nilai fitur
(values). Artinya CSV yang dihasilkan export.ts TIDAK BISA
di-roundtrip balik jadi TrainingSample yang lengkap untuk
training (fitur numeriknya hilang). Import CSV cuma berguna
untuk restore metadata/label, BUKAN untuk training ulang. Untuk
alur export->edit->import->train yang benar-benar utuh, WAJIB
pakai format JSON.

Mengaktifkan services/ml/dataset/importer.ts (sebelumnya orphan
total).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { checkRateLimit } from "@/services/security/rateLimitStore";
import datasetImporter, { ImportFormat } from "@/services/ml/dataset/importer";
import datasetValidator from "@/services/ml/dataset/validator";
import datasetSampler from "@/services/ml/dataset/sampler";
import modelTrainer from "@/services/ml/models/trainer";
import { saveActiveModel } from "@/services/ml/storage/modelStore";

const IMPORT_RATE_LIMIT = 10;
const IMPORT_RATE_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyApiAuth(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized - login diperlukan" });
  }

  const rateLimit = await checkRateLimit(`ml_import:${user.uid}`, IMPORT_RATE_LIMIT, IMPORT_RATE_WINDOW_MS);

  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
    return res.status(429).json({ error: "Terlalu sering import - coba lagi sebentar." });
  }

  const body = req.body ?? {};

  const content: string = body.content;
  const format: ImportFormat = body.format === "CSV" ? "CSV" : "JSON";
  const trainAfterImport: boolean = body.trainAfterImport === true;
  const epochs: number = Number(body.epochs) || 300;
  const balance: boolean = body.balance !== false;

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "Field 'content' (string) wajib diisi." });
  }

  if (format === "CSV" && trainAfterImport) {
    return res.status(400).json({
      error:
        "trainAfterImport tidak didukung untuk format CSV - CSV hasil export.ts tidak menyimpan nilai fitur, cuma metadata. Pakai format JSON untuk training ulang.",
    });
  }

  try {
    const importResult = datasetImporter.import(content, format);

    if (!importResult.success) {
      return res.status(422).json({
        error: "Gagal parse dataset.",
        details: importResult.errors,
      });
    }

    // Validasi ulang (jangan percaya begitu saja dataset dari luar,
    // sekalipun formatnya valid secara sintaks).
    const cleanSamples = importResult.samples.filter((s) => datasetValidator.validate([s]).valid);
    const droppedCount = importResult.samples.length - cleanSamples.length;

    if (!trainAfterImport) {
      return res.status(200).json({
        success: true,
        totalParsed: importResult.total,
        validSamples: cleanSamples.length,
        droppedInvalidSamples: droppedCount,
        parseErrors: importResult.errors,
        message: "Dataset berhasil diparse & divalidasi. Kirim trainAfterImport=true untuk langsung melatih model dari dataset ini.",
      });
    }

    if (cleanSamples.length < 30) {
      return res.status(422).json({
        error: `Sample valid cuma ${cleanSamples.length} - terlalu sedikit untuk training.`,
      });
    }

    const finalSamples = balance
      ? datasetSampler.sample(cleanSamples, { strategy: "BALANCED" }).samples
      : cleanSamples;

    const trainingResult = await modelTrainer.train(finalSamples, { epochs });

    const modelId = `lr_import_${Date.now()}`;

    await saveActiveModel({
      id: modelId,
      algorithm: trainingResult.algorithm,
      pairs: ["(dari dataset import)"],
      resolution: "(dari dataset import)",
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
      totalParsed: importResult.total,
      validSamples: cleanSamples.length,
      droppedInvalidSamples: droppedCount,
      trainedSamples: trainingResult.trainedSamples,
      validationSamples: trainingResult.validationSamples,
      durationMs: trainingResult.durationMs,
      finalTrainLoss: trainingResult.finalTrainLoss,
      validationMetrics: trainingResult.validationMetrics,
    });
  } catch (error: any) {
    console.error("[ML Dataset Import API]", error);
    return res.status(500).json({ error: error.message || "Import gagal" });
  }
}
