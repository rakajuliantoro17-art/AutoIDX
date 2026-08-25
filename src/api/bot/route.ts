/**
==========================================================
AURA Trade OS
Bot API Route
Version : 0.0.3 Alpha

PERBAIKAN KEAMANAN (sesi audit orphan): route ini SEBELUMNYA
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

INTEGRASI ERROR/RESPONSE HELPER (sesi orphan cleanup): ./response.ts
(successResponse/errorResponse lokal) diganti ResponseHelper +
ApiError dari @/lib/error (sebelumnya orphan total -- zero
importer di luar dirinya sendiri, cuma dipakai internal oleh
lib/validators/* yang JUGA orphan). Perilaku response JSON
IDENTIK, cuma menghilangkan duplikasi implementasi envelope
yang sama persis dengan ./response.ts. File ./response.ts
SENGAJA TIDAK dihapus -- cuma tidak dipakai lagi di sini,
belum dicek dipakai tempat lain atau tidak.

Ini pilot/contoh integrasi TERBATAS pada 1 file yang saya
kuasai penuh (belum disentuh sesi Claude lain) -- BUKAN
migrasi massal ke seluruh API routes. lib/error/Logger.ts &
lib/error/Response.ts masih orphan di tempat lain, AppError
masih cuma dipakai lib/validators/* yang sendiri juga orphan
(tidak reachable dari live path). Kalau mau dilanjutkan ke
file lain, lakukan satu-satu (risiko tabrakan dengan sesi lain
yang sedang paralel mengedit repo yang sama).
==========================================================
*/

import { executeBot } from "./execute";
import ResponseHelper from "@/lib/error/Response";
import { ApiError } from "@/lib/error/ApiError";
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
      throw ApiError.unauthorized("Unauthorized");
    }

    const lock = await acquireCronLock();

    if (!lock.acquired) {
      logger.info(
        "BOT",
        "Bot execution di-skip -- siklus cron lain sedang berjalan."
      );
      return ResponseHelper.success({
        skipped: true,
        message: "Skipped: previous cycle still running.",
      });
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

    return ResponseHelper.success(result);

  } catch (error) {

    logger.error(
      "BOT",
      "Bot execution failed.",
      error
    );

    if (error instanceof ApiError) {
      return ResponseHelper.error(error.message, error.status, error.code);
    }

    return ResponseHelper.internal(
      error instanceof Error ? error.message : "Unknown error"
    );

  }
}
