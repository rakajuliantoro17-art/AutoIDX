/**
==========================================================
AURA Trade OS
AI Score Calibration Summary API
Version : 0.1.0 Alpha
==========================================================
GET /api/analytics/ai-calibration  (WAJIB login - Firebase ID Token)

Membaca hasil evaluasi dari services/analytics/aiCalibration.ts
(koleksi `aiCalibration`) dan meringkasnya jadi hit-rate --
JAWABAN BERBASIS DATA untuk "apakah AI Score siap dipromosikan
jadi filter BUY/SELL otomatis?".

Cara membaca hasilnya:
- hitRatePercent mendekati 33% (untuk 3 kelas BULLISH/BEARISH/
  NEUTRAL) berarti AI Score SAMA SAJA dengan tebak acak -- BELUM
  siap dipromosikan.
- Perlu SAMPLE CUKUP (lihat totalEvaluated) sebelum kesimpulan apa
  pun bisa dipercaya -- beberapa lusin sample belum cukup untuk
  membedakan "beruntung" dari "benar-benar prediktif".
- Ini HANYA mengevaluasi AI Score (BasicPredictionModel). Model ML
  dari ML Lab (services/ml/*) tidak dievaluasi di sini -- lihat
  catatan di aiCalibration.ts soal kenapa validationMetrics model
  ML itu sendiri masih perlu diperbaiki dulu (shuffle split, bukan
  time-based split) sebelum dipercaya.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "@/services/firebase/admin";

const MAX_READ = 500;

async function getUidFromRequest(req: NextApiRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.replace("Bearer ", "");

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch (error) {
    console.error("[AI Calibration API] Token invalid:", error);
    return null;
  }
}

interface CalibrationDoc {
  pair: string;
  capturedAt: number;
  priceAtCapture: number;
  aiScore: number;
  aiDirection: "BULLISH" | "BEARISH" | "NEUTRAL";
  aiConfidence: number;
  opportunityScore: number;
  evaluated: boolean;
  evaluatedAt?: number;
  priceAtEvaluation?: number;
  actualChangePercent?: number;
  actualDirection?: "BULLISH" | "BEARISH" | "NEUTRAL";
  aiCorrect?: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const uid = await getUidFromRequest(req);

  if (!uid) {
    return res.status(401).json({ error: "Unauthorized - login diperlukan" });
  }

  try {
    // Cuma equality filter (evaluated == true) + limit -- SENGAJA
    // tidak pakai orderBy di query Firestore supaya tidak perlu
    // composite index (yang perlu dibuat manual lewat Firebase
    // Console). Diurutkan di sini saja, di memory, setelah dibaca.
    const snapshot = await adminDb
      .collection("aiCalibration")
      .where("evaluated", "==", true)
      .limit(MAX_READ)
      .get();

    const docs = snapshot.docs.map((doc) => doc.data() as CalibrationDoc);
    docs.sort((a, b) => (b.evaluatedAt ?? 0) - (a.evaluatedAt ?? 0));

    const totalEvaluated = docs.length;
    const totalCorrect = docs.filter((d) => d.aiCorrect).length;
    const hitRatePercent =
      totalEvaluated > 0
        ? Math.round((totalCorrect / totalEvaluated) * 10000) / 100
        : 0;

    // Breakdown per arah prediksi -- supaya kelihatan kalau AI Score
    // "cuma jago" di satu arah (mis. selalu benar pas prediksi
    // NEUTRAL karena NEUTRAL memang paling sering terjadi, TAPI
    // gagal total pas prediksi BULLISH/BEARISH).
    const byDirection: Record<
      string,
      { total: number; correct: number; hitRatePercent: number }
    > = {};

    for (const direction of ["BULLISH", "BEARISH", "NEUTRAL"] as const) {
      const subset = docs.filter((d) => d.aiDirection === direction);
      const correct = subset.filter((d) => d.aiCorrect).length;

      byDirection[direction] = {
        total: subset.length,
        correct,
        hitRatePercent:
          subset.length > 0
            ? Math.round((correct / subset.length) * 10000) / 100
            : 0,
      };
    }

    const RANDOM_BASELINE_PERCENT = 33.33;

    const readyForPromotion =
      totalEvaluated >= 100 && hitRatePercent >= RANDOM_BASELINE_PERCENT + 15;

    return res.status(200).json({
      totalEvaluated,
      totalCorrect,
      hitRatePercent,
      randomBaselinePercent: RANDOM_BASELINE_PERCENT,
      byDirection,
      readyForPromotion,
      recentSamples: docs.slice(0, 30),
      note:
        totalEvaluated < 100
          ? `Baru ${totalEvaluated} sample dievaluasi -- terlalu sedikit untuk kesimpulan yang bisa dipercaya. Tunggu setidaknya 100+ sample (beberapa hari-minggu, tergantung berapa sering pair yang sama jadi top opportunity).`
          : readyForPromotion
          ? "Hit-rate cukup jauh di atas tebakan acak dengan sample yang memadai -- layak dipertimbangkan untuk dipromosikan sebagai filter tambahan (bukan pengganti) di DecisionEngine."
          : "Hit-rate belum cukup jauh di atas tebakan acak (33%) -- JANGAN dipromosikan jadi filter BUY/SELL otomatis dulu.",
    });
  } catch (error) {
    console.error("[AI Calibration API]", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil ringkasan kalibrasi AI Score.",
    });
  }
}
