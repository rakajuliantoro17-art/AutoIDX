/**
==========================================================
AURA Trade OS
Run Cycle (inti, tidak tergantung platform)
Version : 0.1.0
==========================================================
SATU-SATUNYA pintu masuk untuk menjalankan siklus scan+trading
beserta lock dan heartbeat-nya. Dipakai oleh:
- pages/api/cron/scan.ts  (cron-job.org / GitHub Actions / scheduler lokal)
- api/bot/route.ts        (trigger manual /api/bot)

Modul ini TIDAK mengimpor Next/Vercel apa pun, jadi sama persis
dipakai di serverless maupun server fisik. Urusan HTTP (auth,
status code, format response) tetap di adapter masing-masing.

Urutan: acquire lock -> runScanCycle() -> recordHeartbeat() ->
release lock (selalu, di finally).
==========================================================
*/

import { runScanCycle, type ScanCycleResult } from "@/services/scheduler/scanCycle";
import { acquireCronLock } from "@/services/scheduler/cronLock";
import { recordHeartbeat } from "@/services/scheduler/cronHeartbeat";
import { handleError } from "@/services/errors/errorHandler";
import { recordLog } from "@/services/firebase/logService";

export type RunCycleOutcome =
  | {
      status: "skipped";
      /** true = terlalu cepat sejak siklus terakhir; false = siklus lain masih berjalan */
      throttled: boolean;
      reason: string;
    }
  | {
      status: "completed";
      result: ScanCycleResult;
      durationMs: number;
    };

export interface RunCycleOptions {
  /** Jarak minimum antar-mulai siklus. 0 = tanpa throttle (trigger manual). */
  minIntervalMs?: number;
}

/**
 * Jalankan 1 siklus penuh. Melempar error kalau siklus gagal
 * (lock tetap dilepas). Pemanggil menangani error lewat
 * reportCycleFailure().
 */
export async function runCycle(
  options: RunCycleOptions = {}
): Promise<RunCycleOutcome> {
  const lock = await acquireCronLock(options.minIntervalMs ?? 0);

  if (!lock.acquired) {
    const throttled = lock.reason === "throttled";

    return {
      status: "skipped",
      throttled,
      reason: throttled
        ? "Too soon since last cycle (CRON_SCAN_MIN_INTERVAL_SECONDS)"
        : "Previous cron cycle still running",
    };
  }

  try {
    const startedAt = Date.now();

    const result = await runScanCycle();
    const durationMs = Date.now() - startedAt;

    // Heartbeat hanya di akhir siklus SUKSES (dipakai
    // /api/health/status dan reconcile.ts untuk status ALIVE/DEAD).
    await recordHeartbeat({
      durationMs,
      qualifiedCount: result.summary.qualifiedCount,
      phasesMs: result.phasesMs,
    });

    return { status: "completed", result, durationMs };
  } finally {
    await lock.release();
  }
}

/**
 * Catat kegagalan siklus (console + log Firestore, best-effort) dan
 * kembalikan info aman untuk response. Log Vercel Hobby disimpan
 * singkat, jadi kegagalan juga dicatat ke Firestore.
 */
export async function reportCycleFailure(
  error: unknown,
  source: string
): Promise<{ category: string; retryable: boolean }> {
  console.error(`[${source.toUpperCase()} ERROR]`, error);

  const handled = handleError(error, { source });

  try {
    await recordLog(
      "SYSTEM",
      "danger",
      `[Scan] Siklus gagal [${handled.category}${handled.retryable ? ", retryable" : ""}]: ${handled.error.message}`
    );
  } catch {
    /* pencatatan gagal tidak boleh mengubah respons */
  }

  return { category: handled.category, retryable: handled.retryable };
}
