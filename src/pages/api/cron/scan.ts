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
import { runScanCycle } from "@/services/scheduler/scanCycle";
import { acquireCronLock } from "@/services/scheduler/cronLock";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const cronSecret = process.env.CRON_SECRET?.trim();

  // Kalau CRON_SECRET belum di-set di Vercel, ini KESALAHAN KONFIGURASI
  // server -- balas 500, JANGAN 401. Sebelumnya `Bearer ${undefined}`
  // dibandingkan sebagai string literal "Bearer undefined", yang
  // membuat kegagalan config tidak terbedakan dari token yang salah
  // di GitHub Actions -- keduanya sama-sama 401 tanpa penjelasan.
  if (!cronSecret) {
    console.error("[CRON SCAN] CRON_SECRET belum di-set di environment Vercel.");
    return res.status(500).json({ error: "Server misconfigured: CRON_SECRET not set" });
  }

  const rawAuthHeader = req.headers.authorization;
  const authHeader = rawAuthHeader?.trim();
  const expectedToken = `Bearer ${cronSecret}`;

  if (authHeader !== expectedToken) {
    console.error(
      "[CRON SCAN] Unauthorized. " +
      `Panjang header diterima: ${rawAuthHeader?.length ?? 0} (setelah trim: ${authHeader?.length ?? 0}). ` +
      `Panjang token diharapkan: ${expectedToken.length}. ` +
      "Cek apakah GitHub Actions secret CRON_SECRET persis sama dengan env var CRON_SECRET di Vercel " +
      "(case-sensitive, tanpa spasi/newline ekstra), dan environment scope-nya mencakup Production."
    );
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

  try {

    const { summary, trading, aiCalibration } = await runScanCycle();

    return res.status(200).json({
      success: true,
      executedAt: new Date().toISOString(),
      summary,
      trading,
      aiCalibration,
    });

  } catch (error) {
    console.error("[CRON SCAN ERROR]", error);
    return res.status(500).json({ error: "Scan failed" });
  } finally {
    await lock.release();
  }

}
