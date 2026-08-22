/**
==========================================================
AURA Trade OS
AI Score Calibration Tracker
Version : 0.1.0

Menjawab "apakah AI Score (services/ai/prediction) siap
dipromosikan jadi filter BUY/SELL otomatis?" dengan DATA,
bukan tebakan.

Cara kerja:
1. recordCalibrationSnapshots() dipanggil tiap siklus scan,
   menyimpan snapshot aiScore/aiDirection/aiConfidence +
   harga saat itu untuk tiap pair di topOpportunities yang
   punya data AI (aiDirection terisi).
2. Snapshot itu "jatuh tempo" untuk dievaluasi setelah
   EVALUATION_DELAY_MS (default 30 menit) -- cukup waktu untuk
   melihat apakah harga benar-benar bergerak sesuai arah yang
   diprediksi.
3. evaluateDueCalibrations() dipanggil tiap siklus scan,
   mengambil snapshot yang sudah jatuh tempo & belum dievaluasi,
   membandingkan harga sekarang vs harga saat snapshot, lalu
   menandai prediksinya benar/salah.

Fail-safe sepenuhnya: kalau ada error di sini (Firestore/
network), fungsi mengembalikan hasil kosong dan TIDAK PERNAH
melempar exception ke scan.ts -- scan/trading di atasnya sudah
selesai lebih dulu dan tidak boleh terganggu oleh fitur
observasional ini.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import indodaxTickerService from "@/services/indodax/ticker.js";
import type { ScannedPairResult } from "@/services/scanner/types";

const COLLECTION = "aiCalibrationSnapshots";

/**
 * Berapa lama menunggu sebelum sebuah snapshot dievaluasi.
 * 30 menit dipilih supaya pergerakan harga cukup berarti untuk
 * dibandingkan dengan arah yang diprediksi (bukan cuma noise).
 */
const EVALUATION_DELAY_MS = 30 * 60 * 1000;

/**
 * Perubahan harga di bawah ini (%) dianggap "tidak bergerak
 * berarti" -- dipakai untuk menentukan arah aktual (BULLISH/
 * BEARISH/NEUTRAL) supaya konsisten dengan cara aiDirection
 * diberi label.
 */
const NEUTRAL_THRESHOLD_PERCENT = 0.15;

/**
 * Batas jumlah snapshot yang dievaluasi per siklus cron, supaya
 * satu invocation tidak meledak melakukan puluhan network call
 * ke Indodax kalau ada backlog snapshot yang jatuh tempo
 * bersamaan.
 */
const MAX_EVALUATIONS_PER_CYCLE = 25;

interface CalibrationSnapshotDoc {
  pair: string;
  symbol: string;
  aiScore: number;
  aiDirection: "BULLISH" | "BEARISH" | "NEUTRAL";
  aiConfidence: number;
  opportunityScore: number;
  signalRecommendation: ScannedPairResult["signalRecommendation"];
  priceAtSnapshot: number;
  snapshotAt: FieldValue;
  dueAt: Timestamp;
  evaluated: boolean;
  correct: boolean | null;
  priceAtEvaluation: number | null;
  priceChangePercent: number | null;
  actualDirection: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  evaluatedAt: FieldValue | null;
}

export interface RecordCalibrationResult {
  written: number;
}

export interface EvaluateCalibrationResult {
  evaluated: number;
  correct: number;
}

/**
 * Menyimpan snapshot aiScore/aiDirection tiap pair di
 * topOpportunities yang punya data AI. Pair tanpa aiDirection
 * (mis. gagal dianalisa PredictionEngine siklus ini) dilewati.
 */
export async function recordCalibrationSnapshots(
  topOpportunities: ScannedPairResult[]
): Promise<RecordCalibrationResult> {
  try {
    const eligible = topOpportunities.filter(
      (result) => result.aiDirection !== undefined && result.aiScore !== undefined
    );

    if (eligible.length === 0) {
      return { written: 0 };
    }

    const dueAt = Timestamp.fromMillis(Date.now() + EVALUATION_DELAY_MS);

    const batch = adminDb.batch();
    const collectionRef = adminDb.collection(COLLECTION);

    for (const result of eligible) {
      const docRef = collectionRef.doc();

      const snapshot: CalibrationSnapshotDoc = {
        pair: result.pair,
        symbol: result.symbol,
        aiScore: result.aiScore as number,
        aiDirection: result.aiDirection as "BULLISH" | "BEARISH" | "NEUTRAL",
        aiConfidence: result.aiConfidence ?? 0,
        opportunityScore: result.opportunityScore,
        signalRecommendation: result.signalRecommendation,
        priceAtSnapshot: result.lastPrice,
        snapshotAt: FieldValue.serverTimestamp(),
        dueAt,
        evaluated: false,
        correct: null,
        priceAtEvaluation: null,
        priceChangePercent: null,
        actualDirection: null,
        evaluatedAt: null,
      };

      batch.set(docRef, snapshot);
    }

    await batch.commit();

    return { written: eligible.length };
  } catch (error) {
    console.error("[AI CALIBRATION] Gagal menyimpan snapshot:", error);
    return { written: 0 };
  }
}

/**
 * Mengubah persentase perubahan harga jadi label arah, dengan
 * band netral supaya konsisten dengan cara aiDirection diberi
 * label oleh PredictionEngine.
 */
function resolveActualDirection(
  changePercent: number
): "BULLISH" | "BEARISH" | "NEUTRAL" {
  if (changePercent >= NEUTRAL_THRESHOLD_PERCENT) return "BULLISH";
  if (changePercent <= -NEUTRAL_THRESHOLD_PERCENT) return "BEARISH";
  return "NEUTRAL";
}

/**
 * Mengambil snapshot yang sudah jatuh tempo & belum dievaluasi,
 * membandingkan harga sekarang terhadap harga saat snapshot
 * diambil, lalu menandai prediksinya benar/salah.
 *
 * Snapshot yang gagal diambil harganya sekarang (mis. Indodax
 * error/pair delisted) dilewati apa adanya -- akan dicoba lagi
 * di siklus cron berikutnya, tidak ditandai gagal permanen.
 */
export async function evaluateDueCalibrations(): Promise<EvaluateCalibrationResult> {
  try {
    const now = Timestamp.fromMillis(Date.now());

    const dueSnapshot = await adminDb
      .collection(COLLECTION)
      .where("evaluated", "==", false)
      .where("dueAt", "<=", now)
      .limit(MAX_EVALUATIONS_PER_CYCLE)
      .get();

    if (dueSnapshot.empty) {
      return { evaluated: 0, correct: 0 };
    }

    let evaluated = 0;
    let correct = 0;

    const batch = adminDb.batch();

    for (const doc of dueSnapshot.docs) {
      const data = doc.data() as CalibrationSnapshotDoc;

      const ticker = await indodaxTickerService.getFormattedTicker(data.pair);

      if (!ticker || !ticker.lastPrice) {
        // Gagal ambil harga sekarang -- coba lagi siklus berikutnya,
        // jangan ditandai evaluated supaya tidak hilang.
        continue;
      }

      const priceChangePercent =
        data.priceAtSnapshot > 0
          ? ((ticker.lastPrice - data.priceAtSnapshot) / data.priceAtSnapshot) * 100
          : 0;

      const actualDirection = resolveActualDirection(priceChangePercent);
      const isCorrect = actualDirection === data.aiDirection;

      batch.update(doc.ref, {
        evaluated: true,
        correct: isCorrect,
        priceAtEvaluation: ticker.lastPrice,
        priceChangePercent: Number(priceChangePercent.toFixed(4)),
        actualDirection,
        evaluatedAt: FieldValue.serverTimestamp(),
      });

      evaluated += 1;
      if (isCorrect) correct += 1;
    }

    if (evaluated > 0) {
      await batch.commit();
    }

    return { evaluated, correct };
  } catch (error) {
    console.error("[AI CALIBRATION] Gagal evaluasi snapshot:", error);
    return { evaluated: 0, correct: 0 };
  }
}
