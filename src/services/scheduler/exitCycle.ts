/**
==========================================================
AURA Trade OS
Exit Cycle (pengamat SL/TP, ringan)
==========================================================
Dipanggil /api/cron/exit (mis. tiap 2 menit). HANYA untuk posisi
terbuka: ambil harga ticker publik terkini, cek SL/TP, jalankan
SELL bila kena. Tidak scan market, tidak hitung indikator, tidak BUY.
Saling-eksklusi dengan siklus scan lewat cronLock (doc "cronExit").
==========================================================
*/

import type { CronLockHandle } from "@/services/scheduler/cronLock";

export interface ExitCycleDeps {
  /** Pemanggil mengikat doc kunci "cronExit" (EXIT_LOCK_DOC_ID). */
  acquireLock: (minIntervalMs: number) => Promise<CronLockHandle>;
  getOpenPairs: () => Promise<string[]>;
  getPrice: (pair: string) => Promise<number | null>;
  checkExit: (input: { pair: string; price: number }) => Promise<unknown | null>;
  recordHeartbeat?: (info: { checked: number; exited: number; durationMs: number }) => Promise<void>;
  now?: () => number;
}

export type ExitCycleOutcome =
  | { status: "skipped"; throttled: boolean; reason: string }
  | { status: "completed"; checked: number; exited: string[]; errors: string[]; durationMs: number };

export const EXIT_MIN_INTERVAL_MS = 60_000;

export async function runExitCycle(deps: ExitCycleDeps, minIntervalMs = EXIT_MIN_INTERVAL_MS): Promise<ExitCycleOutcome> {
  const now = deps.now ?? Date.now;
  const lock = await deps.acquireLock(minIntervalMs);
  if (!lock.acquired) {
    const throttled = lock.reason === "throttled";
    return {
      status: "skipped",
      throttled,
      reason: throttled ? "Too soon since last exit check" : "Scan or exit cycle still running",
    };
  }
  const startedAt = now();
  try {
    const pairs = await deps.getOpenPairs();
    const exited: string[] = [];
    const errors: string[] = [];
    for (const pair of pairs) {
      try {
        const price = await deps.getPrice(pair);
        if (!price || !Number.isFinite(price) || price <= 0) {
          errors.push(`${pair}: harga tidak valid`);
          continue;
        }
        const r = await deps.checkExit({ pair, price });
        if (r) exited.push(pair);
      } catch (e) {
        errors.push(`${pair}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    const durationMs = now() - startedAt;
    if (deps.recordHeartbeat) {
      await deps.recordHeartbeat({ checked: pairs.length, exited: exited.length, durationMs }).catch(() => undefined);
    }
    return { status: "completed", checked: pairs.length, exited, errors, durationMs };
  } finally {
    await lock.release();
  }
}
