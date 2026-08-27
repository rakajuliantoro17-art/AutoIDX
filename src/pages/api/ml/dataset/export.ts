/**
==========================================================
AURA Trade OS
ML Dataset Export API
Version : 0.1.0 Alpha

GET /api/ml/dataset/export (WAJIB login - Firebase ID Token)
Query params (semua opsional):
  ?pairs=btc_idr,eth_idr        default: 5 pair paling likuid
  ?resolution=60                default candle 1 jam
  ?candleLimit=500
  ?futureWindow=10
  ?profitThreshold=2
  ?lossThreshold=-2
  ?balance=true|false           default true
  ?format=json|csv              default json

Menjalankan pipeline yang SAMA dengan /api/ml/train (collect ->
label -> validasi -> balance) TAPI TIDAK melatih model apapun -
cuma untuk inspeksi manual/audit dataset offline (mis. dibuka di
spreadsheet, atau dianalisis di luar aplikasi ini). Mengaktifkan
services/ml/dataset/exporter.ts (sebelumnya orphan total).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { checkRateLimit } from "@/services/security/rateLimitStore";
import { collectDataset } from "@/services/ml/dataset/collector";
import { DatasetBuilder } from "@/services/ml/dataset/builder";
import datasetValidator from "@/services/ml/dataset/validator";
import datasetSampler from "@/services/ml/dataset/sampler";
import datasetExporter, { DatasetFormat } from "@/services/ml/dataset/exporter";

const DEFAULT_PAIRS = ["btc_idr", "eth_idr", "sol_idr", "usdt_idr", "xrp_idr"];

// Sama beratnya dengan training (tarik candle historis asli dari
// Indodax) - dibatasi sama seperti /api/ml/train.
const EXPORT_RATE_LIMIT = 5;
const EXPORT_RATE_WINDOW_MS = 10 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyApiAuth(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized - login diperlukan" });
  }

  const rateLimit = await checkRateLimit(`ml_export:${user.uid}`, EXPORT_RATE_LIMIT, EXPORT_RATE_WINDOW_MS);

  if (!rateLimit.allowed) {
    res.setHeader("Retry-After", Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
    return res.status(429).json({
      error: `Terlalu sering export (maks ${EXPORT_RATE_LIMIT}x per 10 menit).`,
    });
  }

  const q = req.query;

  const pairs: string[] =
    typeof q.pairs === "string" && q.pairs.length > 0
      ? q.pairs.split(",").map((p) => p.trim().toLowerCase())
      : DEFAULT_PAIRS;

  const resolution = typeof q.resolution === "string" ? q.resolution : "60";
  const candleLimit = Number(q.candleLimit) || 500;
  const futureWindow = Number(q.futureWindow) || 10;
  const profitThreshold = Number(q.profitThreshold) || 2;
  const lossThreshold = Number(q.lossThreshold) || -2;
  const balance = q.balance !== "false";
  const format: DatasetFormat = q.format === "csv" ? "CSV" : "JSON";

  try {
    const { features, failedPairs } = await collectDataset({ pairs, resolution, candleLimit });

    if (features.length < 30) {
      return res.status(422).json({
        error: `Dataset terlalu kecil (${features.length} sample) untuk diexport secara bermakna.`,
        failedPairs,
      });
    }

    const builder = new DatasetBuilder({ futureWindow, profitThreshold, lossThreshold });
    const built = builder.build(features);

    const cleanSamples = built.samples.filter((s) => datasetValidator.validate([s]).valid);

    const finalSamples = balance
      ? datasetSampler.sample(cleanSamples, { strategy: "BALANCED" }).samples
      : cleanSamples;

    const exportResult = datasetExporter.export(finalSamples, format, "aura_dataset");

    if (format === "CSV") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${exportResult.filename}"`);
      return res.status(200).send(exportResult.content);
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${exportResult.filename}"`);
    return res.status(200).send(exportResult.content);
  } catch (error: any) {
    console.error("[ML Dataset Export API]", error);
    return res.status(500).json({ error: error.message || "Export gagal" });
  }
}
