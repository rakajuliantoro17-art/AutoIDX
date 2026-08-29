/**
==========================================================
AURA Trade OS
ML Prediction API
Version : 0.1.0 Alpha

GET /api/ml/predict?pair=btc_idr  (WAJIB login)

Ambil candle TERBARU dari Indodax untuk pair yang diminta,
hitung fitur teknikal (indikator yang sama dengan Market
Scanner), lalu jalankan inference dari model ML aktif yang
tersimpan (lihat services/ml/storage/modelStore.ts).

STATUS: ADVISORY ONLY. Endpoint ini TIDAK dipanggil dari
services/execution atau services/liveTrading manapun -
hasilnya cuma untuk dilihat/dievaluasi manusia, belum jadi
bagian dari keputusan order otomatis. Lihat docs/claude.md,
"Audit Detail: AI/ML Layer", untuk alasan & rencana ke depan.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";

import { verifyApiAuth } from "@/lib/auth/verifyApiAuth";
import { getCandles } from "@/services/indodax/candles";
import {
  calculateRSI,
  calculateEMA,
  calculateMACD,
  calculateADX,
  calculateStochastic,
  OHLC,
} from "@/services/indicators";
import modelPredictor from "@/services/ml/models/predictor";
import { FirestoreRepository, RepositoryRecord } from "@/services/ml/storage/repository";

/**
 * Riwayat prediksi -- dicatat SETIAP kali endpoint ini dipanggil,
 * supaya bisa dievaluasi belakangan: apakah label yang diprediksi
 * model (BUY/SELL/HOLD) benar-benar cocok dengan pergerakan harga
 * yang SUNGGUHAN terjadi setelahnya. Ini murni observasional --
 * TIDAK mempengaruhi respons endpoint atau keputusan apa pun.
 */
interface PredictionLogEntry {
  pair: string;
  price: number;
  candleTime: string;
  label: string;
  confidence: number;
  modelId: string;
  modelValidationAccuracy: number;
}

const predictionLog = new FirestoreRepository<PredictionLogEntry>("ml_predictions");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyApiAuth(req);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized - login diperlukan" });
  }

  const pair = String(req.query.pair ?? "btc_idr").toLowerCase();
  const resolution = String(req.query.resolution ?? "60");

  try {
    const candles = await getCandles({ pair, resolution, limit: 100 });

    if (candles.length < 60) {
      return res.status(422).json({
        error: `Candle tidak cukup untuk pair "${pair}" (dapat ${candles.length}, butuh minimal 60).`,
      });
    }

    const closes = candles.map((c) => c.close);
    const ohlc: OHLC[] = candles.map((c) => ({ high: c.high, low: c.low, close: c.close }));
    const last = candles[candles.length - 1];

    const macd = calculateMACD(closes);
    const adx = calculateADX(ohlc, 14);
    const stochastic = calculateStochastic(ohlc, 14, 3);
    const emaFast = calculateEMA(closes, 9);
    const emaSlow = calculateEMA(closes, 21);

    const features = {
      price: last.close,
      rsi14: calculateRSI(closes, 14),
      emaFast,
      emaSlow,
      emaSpreadPct: emaSlow !== 0 ? ((emaFast - emaSlow) / emaSlow) * 100 : 0,
      macd: macd.macd,
      macdSignal: macd.signal,
      macdHistogram: macd.histogram,
      adx: adx.adx,
      plusDI: adx.plusDI,
      minusDI: adx.minusDI,
      stochK: stochastic.k,
      stochD: stochastic.d,
      volume: last.volume,
    };

    const prediction = await modelPredictor.predict({ features });

    // Catat riwayat -- best-effort (tidak boleh menggagalkan respons
    // endpoint kalau gagal, murni observasional).
    const logEntry: RepositoryRecord<PredictionLogEntry> = {
      id: `${pair}_${Date.now()}`,
      data: {
        pair,
        price: last.close,
        candleTime: new Date(last.time * 1000).toISOString(),
        label: prediction.label,
        confidence: prediction.confidence,
        modelId: prediction.modelId,
        modelValidationAccuracy: prediction.modelValidationAccuracy,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    predictionLog.save(logEntry).catch((logError) => {
      console.error("[ML Predict API] Gagal mencatat riwayat prediksi:", logError);
    });

    return res.status(200).json({
      pair,
      price: last.close,
      candleTime: new Date(last.time * 1000).toISOString(),
      features,
      prediction: {
        label: prediction.label,
        confidence: prediction.confidence,
        probabilities: prediction.probabilities,
      },
      model: {
        id: prediction.modelId,
        trainedAt: prediction.modelTrainedAt,
        validationAccuracy: prediction.modelValidationAccuracy,
      },
      note:
        "ADVISORY ONLY - belum disambungkan ke eksekusi order otomatis. " +
        "Cek validationAccuracy: kalau mendekati 1/(jumlah kelas) berarti model belum belajar apa-apa (setara tebak acak).",
    });
  } catch (error: any) {
    console.error("[ML Predict API]", error);

    const isNoModel = String(error.message || "").includes("Belum ada model ML");

    return res.status(isNoModel ? 409 : 500).json({ error: error.message || "Prediction failed" });
  }
}
