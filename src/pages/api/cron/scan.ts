/**
==========================================================
AURA Trade OS
Cron: Market Scanner + Trading Engine Trigger
Version : 0.1.1

Dilengkapi distributed lock (Firestore) supaya kalau
trigger eksternal (cron-job.org, interval 30 detik)
menembak request baru sebelum siklus sebelumnya selesai,
request baru itu di-skip dengan aman (bukan dijalankan
dobel).

v0.2.1: auth -> lib/auth/cronAuth.ts, lock+scan+heartbeat ->
services/scheduler/runCycle.ts (dipakai bersama /api/bot) supaya
perilaku identik di serverless maupun server fisik.

FIX v0.2.0 (audit orphan): logic scan+trade diekstrak ke
services/scheduler/scanCycle.ts (runScanCycle()) supaya bisa
dipakai bersama dengan api/webhook (event "scan"). Ini SEKALIGUS
mengembalikan pemanggilan recordCalibrationSnapshots()/
evaluateDueCalibrations() yang sempat hilang di commit
"Refactor cron scan handler by removing unused code" -- lihat
catatan lengkap di scanCycle.ts.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyCronSecret } from "@/lib/auth/cronAuth";
import { runCycle, reportCycleFailure } from "@/services/scheduler/runCycle";
import { getScanMinIntervalMs } from "@/services/scheduler/cronLock";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const auth = verifyCronSecret(req.headers.authorization, "CRON SCAN");

  if (!auth.ok) {
    console.error(auth.logMessage);
    return res.status(auth.status).json({ error: auth.error });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const outcome = await runCycle({ minIntervalMs: getScanMinIntervalMs() });

    if (outcome.status === "skipped") {
      return res.status(200).json({
        success: true,
        skipped: true,
        throttled: outcome.throttled,
        reason: outcome.reason,
        executedAt: new Date().toISOString(),
      });
    }

    const { summary, trading, aiCalibration, phasesMs } = outcome.result;

    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
      summary,
      trading,
      aiCalibration,
      phasesMs,
    });

  } catch (error) {

    const failure = await reportCycleFailure(error, "cron/scan");

    return res.status(500).json({
      error: "Scan failed",
      category: failure.category,
      retryable: failure.retryable,
    });
  }

}
