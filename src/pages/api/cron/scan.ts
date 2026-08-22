/**
==========================================================
AURA Trade OS
Cron: Market Scanner + Trading Engine Trigger
Version : 0.1.0

Dilengkapi distributed lock (Firestore) supaya kalau
trigger eksternal (cron-job.org, interval 30 detik)
menembak request baru sebelum siklus sebelumnya selesai,
request baru itu di-skip dengan aman (bukan dijalankan
dobel).
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import marketScanner from "@/services/scanner";
import { adminDb } from "@/services/firebase/admin";
import { executeCron } from "@/services/scheduler/cron";
import { acquireCronLock } from "@/services/scheduler/cronLock";
import {
  recordCalibrationSnapshots,
  evaluateDueCalibrations,
} from "@/services/analytics/aiCalibration";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const lock = await acquireCronLock();

  if (!lock.acquired) {
    return res.status(200).json({
      success: true,
      skipped: true,
      reason: "Previous cron cycle still running",
      executedAt: new Date().toISOString(),
    });
  }

  const startedAt = Date.now();

  try {

    const summary = await marketScanner.scanMarket();

    await adminDb.collection("scannerResults").doc("latest").set({
      ...summary,
      durationMs: Date.now() - startedAt,
    });

    await adminDb.collection("scannerHistory").add({
      ...summary,
      durationMs: Date.now() - startedAt,
    });

    console.log(
      `[CRON] Scan selesai: ${summary.qualifiedCount}/${summary.scannedCount} pair qualified ` +
      `(skor dianalisa: ${summary.scoreStats.analyzedCount}, ` +
      `min ${summary.scoreStats.minScore}, max ${summary.scoreStats.maxScore}, ` +
      `avg ${summary.scoreStats.avgScore}, threshold ${summary.scoreStats.thresholdUsed})`
    );

    // --- AI Score Calibration Tracker ---------------------------
    // Menjawab "apakah AI Score siap dipromosikan jadi filter
    // BUY/SELL?" dengan DATA, bukan tebakan. Fail-safe sepenuhnya
    // di dalam aiCalibration.ts -- kalau gagal, tidak pernah
    // mengganggu scan/trading di atas (sudah selesai duluan).
    const calibrationEvaluation = await evaluateDueCalibrations();
    const calibrationRecording = await recordCalibrationSnapshots(
      summary.topOpportunities
    );

    if (calibrationEvaluation.evaluated > 0) {
      console.log(
        `[CRON] Kalibrasi AI Score: ${calibrationEvaluation.evaluated} snapshot dievaluasi, ${calibrationEvaluation.correct} benar.`
      );
    }

    // SEMUA pair yang lolos filter opportunityScore (bukan cuma top 10
    // topOpportunities yang dipakai dashboard) -- inilah yang
    // menyambungkan scanner ke eksekusi live trading. executeCron()
    // sendiri yang menggabungkannya dengan pair yang sedang open
    // position + watchlist manual, jadi tidak ada posisi yang
    // "ditinggalkan". RISK_CONFIG.maxOpenPosition di TradingEngine
    // tetap jadi batas jumlah posisi terbuka meskipun candidatePairs
    // di sini tidak dibatasi.
    const candidatePairs = summary.qualifiedPairs;

    const tradingResult = await executeCron(candidatePairs);

    console.log("[CRON] Trading engine:", tradingResult);

    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
      summary,
      trading: tradingResult,
      aiCalibration: {
        evaluated: calibrationEvaluation.evaluated,
        correctThisCycle: calibrationEvaluation.correct,
        newSnapshots: calibrationRecording.written,
      },
    });

  } catch (error) {
    console.error("[CRON SCAN ERROR]", error);
    return res.status(500).json({ error: "Scan failed" });
  } finally {
    await lock.release();
  }

}
