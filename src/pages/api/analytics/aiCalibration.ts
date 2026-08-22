/**
==========================================================
AURA Trade OS
AI Score Calibration Tracker
Version : 0.1.0 Alpha
==========================================================
Menjawab pertanyaan "apakah AI Score & ML Lab siap dipromosikan
jadi filter BUY/SELL otomatis?" -- SEBELUM modul ini, pertanyaan
itu tidak bisa dijawab dengan data sama sekali. aiScore/aiDirection
sudah dihitung tiap siklus scan (scanner/index.ts) dan ditulis ke
Firestore (scannerHistory), TAPI TIDAK PERNAH dibaca ulang untuk
dicek apakah prediksinya benar dibanding pergerakan harga
sesungguhnya. Modul ini menutup celah itu:

1. recordCalibrationSnapshots() -- tiap siklus scan, simpan
   snapshot ringan (pair, harga saat itu, aiScore/aiDirection,
   opportunityScore) ke koleksi `aiCalibration`. HANYA untuk pair
   yang belum punya snapshot "pending" (belum jatuh tempo
   dievaluasi) -- supaya tidak menumpuk ribuan dokumen duplikat
   tiap siklus cron untuk pair yang sama.

2. evaluateDueCalibrations() -- tiap siklus scan JUGA mengecek
   snapshot lama yang sudah lewat CALIBRATION_HORIZON_MS sejak
   diambil, ambil harga SEKARANG (1 request /api/summaries untuk
   SEMUA pair, bukan satu-satu), lalu simpan apakah arah yang
   diprediksi (BULLISH/BEARISH/NEUTRAL) match dengan pergerakan
   harga aktual.

CATATAN JUJUR (harap dibaca sebelum mempercayai hasilnya):
- Horizon evaluasi 4 jam BUKAN angka yang divalidasi ilmiah --
  cuma perkiraan wajar untuk sinyal jangka pendek dari RSI/EMA
  yang dihitung scanner dari ~50 trade TERAKHIR (bukan candle
  interval tetap, jadi timeframe sinyalnya sendiri sudah agak
  kabur/bervariasi antar pair tergantung likuiditas).
- Threshold +-1.5% untuk menentukan arah AKTUAL (BULLISH/BEARISH/
  NEUTRAL) juga masih perkiraan, belum di-tuning dari data nyata.
- Ini mengevaluasi AI SCORE (BasicPredictionModel, heuristik dari
  indikator ternormalisasi) -- BUKAN model ML dari ML Lab
  (services/ml/*). Model ML itu perlu evaluasi TERPISAH: training-
  nya sekarang pakai SHUFFLE train/validation split (lihat
  services/ml/models/trainer.ts), bukan split berbasis waktu --
  untuk data time-series ini rawan look-ahead bias, jadi
  validationMetrics yang dilaporkan di sana KEMUNGKINAN lebih
  optimis daripada performa nyata di masa depan. Itu perlu
  diperbaiki dulu di trainer.ts sebelum validationMetrics-nya bisa
  dipercaya -- modul ini TIDAK memperbaiki itu, cuma menandainya.
- Kesimpulan: JANGAN promosikan AI Score atau model ML manapun jadi
  filter BUY/SELL otomatis sebelum ada beberapa minggu data dari
  modul ini yang menunjukkan hit-rate JAUH di atas tebakan acak
  (>33% untuk 3 kelas BULLISH/BEARISH/NEUTRAL).
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import indodaxMarketService from "@/services/indodax/market";
import type { ScannedPairResult } from "@/services/scanner/types";

const COLLECTION = "aiCalibration";

// 4 jam -- lihat "CATATAN JUJUR" di atas soal kenapa angka ini
// masih perkiraan, bukan hasil tuning dari data nyata.
const CALIBRATION_HORIZON_MS = 4 * 60 * 60 * 1000;

// +-1.5% dianggap NEUTRAL (harga cuma "berisik", bukan pergerakan
// nyata) -- di luar band ini baru dihitung BULLISH/BEARISH aktual.
const NEUTRAL_BAND_PERCENT = 1.5;

// Batas jumlah dokumen "pending" (belum dievaluasi) yang dibaca
// tiap siklus -- cukup besar untuk menampung beberapa jam data,
// tapi tetap terbatas supaya query Firestore tidak membengkak.
const MAX_PENDING_READ = 300;

export type CalibrationDirection = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface CalibrationSnapshot {
  pair: string;
  capturedAt: number;
  priceAtCapture: number;
  aiScore: number;
  aiDirection: CalibrationDirection;
  aiConfidence: number;
  opportunityScore: number;
  evaluated: boolean;
  evaluatedAt?: number;
  priceAtEvaluation?: number;
  actualChangePercent?: number;
  actualDirection?: CalibrationDirection;
  aiCorrect?: boolean;
}

function docId(pair: string, capturedAt: number): string {
  return `${pair}_${capturedAt}`;
}

function resolveActualDirection(changePercent: number): CalibrationDirection {
  if (changePercent >= NEUTRAL_BAND_PERCENT) return "BULLISH";
  if (changePercent <= -NEUTRAL_BAND_PERCENT) return "BEARISH";
  return "NEUTRAL";
}

/**
 * Simpan snapshot BARU untuk pair-pair yang punya aiScore (hasil
 * scan saat ini), TAPI cuma untuk pair yang belum punya snapshot
 * "pending" -- supaya tidak menumpuk duplikat tiap siklus cron
 * untuk pair yang sama (mis. BTC yang terus-menerus jadi top
 * opportunity tiap 30 detik).
 *
 * Fail-safe: kegagalan di sini TIDAK PERNAH mengganggu siklus
 * scan/trading utama -- cuma di-log, dikembalikan {written:0}.
 */
export async function recordCalibrationSnapshots(
  candidates: ScannedPairResult[]
): Promise<{ written: number; skipped: number }> {
  const withAiScore = candidates.filter(
    (c) => typeof c.aiScore === "number" && !!c.aiDirection
  );

  if (withAiScore.length === 0) {
    return { written: 0, skipped: 0 };
  }

  try {
    const pendingSnapshot = await adminDb
      .collection(COLLECTION)
      .where("evaluated", "==", false)
      .limit(MAX_PENDING_READ)
      .get();

    const pairsWithPending = new Set(
      pendingSnapshot.docs.map((doc) => doc.get("pair") as string)
    );

    const now = Date.now();
    const batch = adminDb.batch();

    let written = 0;
    let skipped = 0;

    for (const candidate of withAiScore) {
      if (pairsWithPending.has(candidate.pair)) {
        skipped += 1;
        continue;
      }

      const snapshot: CalibrationSnapshot = {
        pair: candidate.pair,
        capturedAt: now,
        priceAtCapture: candidate.lastPrice,
        aiScore: candidate.aiScore as number,
        aiDirection: candidate.aiDirection as CalibrationDirection,
        aiConfidence: candidate.aiConfidence ?? 0,
        opportunityScore: candidate.opportunityScore,
        evaluated: false,
      };

      const ref = adminDb.collection(COLLECTION).doc(docId(candidate.pair, now));
      batch.set(ref, snapshot);
      written += 1;
    }

    if (written > 0) {
      await batch.commit();
    }

    return { written, skipped };
  } catch (error) {
    console.error("[AI Calibration] Gagal menyimpan snapshot:", error);
    return { written: 0, skipped: 0 };
  }
}

/**
 * Cek snapshot lama yang sudah lewat CALIBRATION_HORIZON_MS,
 * bandingkan prediksi aiDirection dengan pergerakan harga aktual,
 * simpan hasilnya. Fail-safe -- tidak pernah melempar error ke
 * pemanggil (siklus scan/trading utama harus tetap jalan walau
 * evaluasi kalibrasi ini gagal).
 */
export async function evaluateDueCalibrations(): Promise<{
  evaluated: number;
  correct: number;
}> {
  try {
    const pendingSnapshot = await adminDb
      .collection(COLLECTION)
      .where("evaluated", "==", false)
      .limit(MAX_PENDING_READ)
      .get();

    if (pendingSnapshot.empty) {
      return { evaluated: 0, correct: 0 };
    }

    const now = Date.now();

    const dueDocs = pendingSnapshot.docs.filter((doc) => {
      const capturedAt = doc.get("capturedAt") as number;
      return now - capturedAt >= CALIBRATION_HORIZON_MS;
    });

    if (dueDocs.length === 0) {
      return { evaluated: 0, correct: 0 };
    }

    // Satu request ke Indodax untuk harga SEMUA pair sekaligus --
    // bukan satu-satu per pair yang jatuh tempo.
    const marketSnapshot = await indodaxMarketService.getSummaryTickers();
    const priceByPair = new Map<string, number>(
      marketSnapshot.map((t: { pair: string; lastPrice: number }) => [
        t.pair,
        t.lastPrice,
      ])
    );

    const batch = adminDb.batch();
    let correct = 0;
    let evaluatedCount = 0;

    for (const doc of dueDocs) {
      const data = doc.data() as CalibrationSnapshot;
      const currentPrice = priceByPair.get(data.pair);

      if (typeof currentPrice !== "number" || !currentPrice) {
        // Harga sekarang tidak ketemu (pair delisted/data hilang
        // sementara) -- biarkan pending, coba lagi siklus
        // berikutnya. JANGAN ditandai evaluated supaya datanya
        // tidak hilang begitu saja.
        continue;
      }

      const changePercent =
        data.priceAtCapture !== 0
          ? ((currentPrice - data.priceAtCapture) / data.priceAtCapture) * 100
          : 0;

      const actualDirection = resolveActualDirection(changePercent);
      const aiCorrect = actualDirection === data.aiDirection;

      if (aiCorrect) correct += 1;
      evaluatedCount += 1;

      batch.update(doc.ref, {
        evaluated: true,
        evaluatedAt: now,
        priceAtEvaluation: currentPrice,
        actualChangePercent: Math.round(changePercent * 100) / 100,
        actualDirection,
        aiCorrect,
      });
    }

    if (evaluatedCount > 0) {
      await batch.commit();
    }

    return { evaluated: evaluatedCount, correct };
  } catch (error) {
    console.error("[AI Calibration] Gagal evaluasi snapshot:", error);
    return { evaluated: 0, correct: 0 };
  }
}
