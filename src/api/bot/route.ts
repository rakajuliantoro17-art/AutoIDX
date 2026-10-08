/**
==========================================================
AURA Trade OS
Bot API Route (trigger manual /api/bot)
Version : 0.1.0 Alpha

v0.1.0: sekarang HANYA adapter HTTP tipis. Semua logika siklus
(lock, scan+trading, heartbeat) ada di
services/scheduler/runCycle.ts -- fungsi yang SAMA dipakai
/api/cron/scan, jadi trigger manual ini tidak lagi melewatkan
heartbeat/kalibrasi dan tidak bisa menyimpang dari jalur
terjadwal. Auth lewat lib/auth/cronAuth.ts (Bearer CRON_SECRET,
sama dengan cron).

Perubahan perilaku yang disengaja:
- CRON_SECRET kosong -> 500 (kesalahan konfigurasi), bukan 401.
- Menjalankan scan market penuh + trading (sama dengan cron),
  bukan hanya executeCron() tanpa scan.
- Tanpa throttle (trigger manual), tapi tetap tunduk pada lock
  sehingga tidak pernah berjalan bersamaan dengan cron.
- Bentuk data response berubah: {skipped,...} atau
  {summary, trading, aiCalibration, phasesMs, durationMs}.

JANGAN panggil dari browser -- CRON_SECRET tidak boleh terbuka
ke client.
==========================================================
*/

import ResponseHelper from "@/lib/error/Response";
import { ApiError } from "@/lib/error/ApiError";
import { verifyCronSecret } from "@/lib/auth/cronAuth";
import { runCycle } from "@/services/scheduler/runCycle";
import { logger } from "./logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {

    const auth = verifyCronSecret(
      request.headers.get("authorization"),
      "BOT"
    );

    if (!auth.ok) {
      logger.error("BOT", auth.logMessage);

      throw auth.status === 500
        ? ApiError.internal(auth.error)
        : ApiError.unauthorized(auth.error);
    }

    logger.info("BOT", "Bot execution requested.");

    const outcome = await runCycle();

    if (outcome.status === "skipped") {
      logger.info("BOT", `Bot execution di-skip -- ${outcome.reason}.`);

      return ResponseHelper.success({
        skipped: true,
        message: `Skipped: ${outcome.reason}.`,
      });
    }

    logger.success("BOT", "Bot execution completed.", {
      durationMs: outcome.durationMs,
      qualifiedCount: outcome.result.summary.qualifiedCount,
    });

    return ResponseHelper.success({
      ...outcome.result,
      durationMs: outcome.durationMs,
    });

  } catch (error) {

    logger.error("BOT", "Bot execution failed.", error);

    if (error instanceof ApiError) {
      return ResponseHelper.error(error.message, error.status, error.code);
    }

    return ResponseHelper.internal(
      error instanceof Error ? error.message : "Unknown error"
    );

  }
}
