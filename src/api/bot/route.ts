/**
==========================================================
AURA Trade OS
Bot API Route
Version : 0.0.2 Alpha

PERBAIKAN KEAMANAN (audit sesi ini): route ini SEBELUMNYA
tidak punya autentikasi SAMA SEKALI dan tidak memakai
cronLock -- padahal executeBot() -> executeCron() adalah
pipeline TRADING NYATA yang sama persis dipanggil jalur cron
terjadwal (/api/cron/scan.ts). Siapapun yang tahu URL ini
bisa memicu siklus trading live kapan saja tanpa login, DAN
kalau tertembak bersamaan dengan cron terjadwal, executeCron()
bisa berjalan 2x paralel tanpa proteksi apapun (race condition
di Firestore -- posisi/saldo bisa dibaca stale, berpotensi
double BUY).

Sekarang: WAJIB header Authorization: Bearer <CRON_SECRET>
-- reuse env var yang SAMA dengan /api/cron/scan.ts (bukan
secret baru) karena endpoint ini secara fungsi adalah trigger
manual untuk pipeline yang sama, bukan API untuk end-user.
Kalau kamu mau tombol "Run Now" di dashboard nanti, sertakan
header ini dari server-side (jangan expose CRON_SECRET ke
client browser) atau ganti ke verifyApiAuth (Firebase ID
Token) + endpoint terpisah -- BELUM diputuskan sesi ini,
tanya pemilik project dulu kalau mau UI-facing.

Juga sekarang acquireCronLock() SEBELUM executeBot(), pola
identik dengan /api/cron/scan.ts, supaya tidak pernah overlap
dengan cron terjadwal. Kalau lock sedang dipegang siklus lain,
request ini di-skip dengan aman (bukan dijalankan dobel).
==========================================================
*/

import { executeBot } from "./execute";
import { successResponse, errorResponse } from "./response";
import { logger } from "./logger";
import { acquireCronLock } from "@/services/scheduler/cronLock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {

    const authHeader = request.headers.get("authorization");
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
      logger.error("BOT", "Bot execution ditolak -- auth tidak valid.");
      return errorResponse("Unauthorized", 401);
    }

    const lock = await acquireCronLock();

    if (!lock.acquired) {
      logger.info(
        "BOT",
        "Bot execution di-skip -- siklus cron lain sedang berjalan."
      );
      return successResponse(
        { skipped: true },
        "Skipped: previous cycle still running.",
        200
      );
    }

    logger.info(
      "BOT",
      "Bot execution requested."
    );

    let result;

    try {
      result = await executeBot();
    } finally {
      await lock.release();
    }

    logger.success(
      "BOT",
      "Bot execution completed.",
      result.statistics
    );

    return successResponse(
      result,
      "Bot executed successfully."
    );

  } catch (error) {

    logger.error(
      "BOT",
      "Bot execution failed.",
      error
    );

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unknown error",
      500
    );

  }
}
