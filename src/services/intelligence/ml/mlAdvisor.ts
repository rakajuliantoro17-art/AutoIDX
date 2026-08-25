/**
==========================================================
AURA Trade OS
ML Advisory (Observability Only)
Version : 0.1.0 Alpha

Menyambungkan services/ml/models/predictor.ts (model yang
DILATIH SUNGGUHAN oleh services/ml/models/trainer.ts, lihat
POST /api/ml/train) ke jalur advisory di trading/engine.ts.

Sebelum modul ini dibuat, predictor.ts sudah bisa jalan lewat
POST /api/ml/predict tapi hasilnya TIDAK PERNAH dibaca oleh
engine.ts -- bot auto-trading sama sekali tidak tahu model ML
ini ada. Keputusan integrasi ini (Session log terkait,
docs/claude.md) SENGAJA dibatasi: ADVISORY-ONLY, sama persis
seperti AI Advisory (OpenAI/Gemini/Claude/DeepSeek) yang sudah
ada -- dicatat ke recordLog(), TIDAK PERNAH memblokir atau
mengubah keputusan BUY/SELL/HOLD.

PENTING -- batas tanggung jawab modul ini:
1. MURNI observability/logging, sama seperti decisionExplainer.ts.
   Tidak pernah dipanggil di jalur yang menentukan BUY/SELL/HOLD,
   tidak dipakai sebagai gerbang (gate), tidak mengubah nilai
   apapun yang dipakai risk-gate atau eksekusi order.
2. Kalau file ini dihapus total dan pemanggilannya di engine.ts
   dibuang, TIDAK ADA perilaku trading yang berubah -- hanya log
   "[ML Advisory ...]" yang menghilang.
3. Fail-safe menyeluruh: setiap kegagalan (belum ada model
   terlatih, Firestore error, fitur tidak lengkap, dst) ditangkap
   di sini dan mengembalikan null -- caller (engine.ts) tinggal
   skip log kalau null, tidak pernah melempar ke atas.
4. Fitur yang dikirim ke predictor HARUS pakai key yang PERSIS
   sama dengan yang dipakai saat training (lihat
   services/ml/dataset/collector.ts) -- kalau collector.ts
   berubah, mapping di bawah ini WAJIB disesuaikan bersamaan,
   atau prediksi akan diam-diam salah (fitur hilang dianggap 0
   oleh predictor.ts, sudah ada console.warn built-in untuk itu).
5. TIDAK melakukan fetch candle/API Indodax sendiri -- semua
   input diambil dari IndicatorFeatureVector yang SUDAH dihitung
   scheduler/cron.ts untuk siklus trading yang sama, supaya tidak
   ada request Indodax tambahan per pair per siklus.
==========================================================
*/

import modelPredictor, { PredictionResult } from "@/services/ml/models/predictor";
import type { IndicatorFeatureVector } from "@/services/indicators";
import logger from "@/lib/error/Logger";
import { AppError } from "@/lib/error/AppError";

export interface MLAdvisoryResult {
  label: PredictionResult["label"];
  confidence: number;
  logLine: string;
}

/**
 * Mapping IndicatorFeatureVector (dipakai jalur live) -> fitur
 * mentah yang dikonsumsi ModelPredictor, key-nya HARUS sama
 * dengan services/ml/dataset/collector.ts (buildFeatureAt()).
 *
 * emaSpreadPct dihitung ulang dengan formula PERSIS SAMA seperti
 * collector.ts supaya tidak ada divergensi kecil yang bisa
 * menggeser hasil normalisasi di predictor.ts.
 */
function mapFeatures(features: IndicatorFeatureVector): Record<string, number> {
  const emaSpreadPct =
    features.emaSlow !== 0
      ? ((features.emaFast - features.emaSlow) / features.emaSlow) * 100
      : 0;

  return {
    price: features.price,
    rsi14: features.rsi,
    emaFast: features.emaFast,
    emaSlow: features.emaSlow,
    emaSpreadPct,
    macd: features.macd,
    macdSignal: features.macdSignal,
    macdHistogram: features.macdHistogram,
    adx: features.adx,
    // Fallback 0 kalau plusDI/minusDI belum sempat mengalir dari
    // cron.ts versi lama -- predictor.ts sendiri sudah fail-safe
    // untuk fitur yang hilang, ini cuma jaga-jaga tambahan supaya
    // tidak ada `undefined` yang lolos ke Record<string, number>.
    plusDI: features.plusDI ?? 0,
    minusDI: features.minusDI ?? 0,
    stochK: features.stochasticK,
    stochD: features.stochasticD,
    volume: features.volume,
  };
}

/**
 * Minta prediksi model ML aktif untuk satu pair, format jadi satu
 * baris log siap pakai. Return null kalau gagal apapun sebabnya
 * (belum ada model terlatih, Firestore error, dll) -- caller cukup
 * skip logging, JANGAN pernah dianggap error yang menghentikan
 * siklus trading.
 */
export async function getMLAdvisory(
  pair: string,
  features: IndicatorFeatureVector
): Promise<MLAdvisoryResult | null> {
  try {
    const result = await modelPredictor.predict({
      features: mapFeatures(features),
    });

    const confidencePct = Math.round(result.confidence * 100);

    const logLine =
      `label=${result.label}, confidence=${confidencePct}%, ` +
      `model=${result.modelId} (trained ${result.modelTrainedAt}, ` +
      `val.acc=${Math.round(result.modelValidationAccuracy * 100)}%), ` +
      `${result.durationMs.toFixed(0)}ms`;

    return {
      label: result.label,
      confidence: result.confidence,
      logLine: `[ML Advisory ${pair.toUpperCase()}] ${logLine}`,
    };
  } catch (error) {
    // Fail-safe: paling sering karena belum ada model terlatih
    // (lihat error message di predictor.ts) -- ini kondisi NORMAL
    // sebelum training pertama dijalankan, bukan bug.
    // Dibungkus AppError.ai() dulu supaya error punya `code`
    // terstruktur (AI_SERVICE_ERROR) sebelum di-log -- TETAP
    // ditangkap di sini, TIDAK PERNAH dilempar ke atas/menghentikan
    // siklus trading.
    const wrapped = AppError.ai(
      "ML Advisory gagal mendapat prediksi",
      error
    );

    logger.error(wrapped.message, wrapped, {
      service: "mlAdvisor",
      code: wrapped.code,
      pair,
    });
    return null;
  }
}

const mlAdvisor = { getMLAdvisory };
export default mlAdvisor;
