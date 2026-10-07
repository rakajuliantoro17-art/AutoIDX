/**
 * AURA Trade OS -- Health Verdict (murni, tanpa I/O)
 *
 * Menentukan `ok` untuk /api/health/status.
 *
 * Masalah sebelumnya: rekonsiliasi dianggap WAJIB di semua mode, padahal
 * cron/reconcile.ts hanya merekam statusnya di mode LIVE. Di mode paper
 * status itu tidak pernah ada, sehingga endpoint selamanya 503 dan uptime
 * monitor membunyikan alarm palsu. Sebaliknya, di mode live status lama
 * (cron reconcile mati) tetap dianggap "ok" selama `consistent: true`.
 *
 * Aturan sekarang:
 * - Scan harus ALIVE (semua mode).
 * - LIVE: rekonsiliasi wajib ada, konsisten, DAN segar -- batas umur sama
 *   dengan gerbang BUY (BOT_CANARY_RECONCILIATION_MAX_AGE_MINUTES).
 * - PAPER: rekonsiliasi tidak wajib (tidak ada posisi nyata di Indodax).
 * - Mode tidak diketahui (Firestore gagal dibaca): diperlakukan sebagai LIVE
 *   (fail-closed).
 */

export type HealthBotMode = "live" | "paper" | "unknown";

export interface ReconciliationInput {
  readonly consistent: boolean;
  readonly checkedAt: number;
}

export interface HealthVerdictInput {
  readonly scanStatus: string;
  readonly reconciliation: ReconciliationInput | null;
  readonly mode: HealthBotMode;
  readonly reconciliationMaxAgeMs: number;
  readonly now: number;
}

export interface HealthVerdict {
  readonly ok: boolean;
  readonly reconciliation: {
    readonly required: boolean;
    readonly consistent: boolean | null;
    readonly fresh: boolean | null;
    readonly lastCheckedAgoMs: number | null;
  };
}

export function evaluateHealth(input: HealthVerdictInput): HealthVerdict {
  const { reconciliation, now } = input;

  const required = input.mode !== "paper";

  const ageMs = reconciliation !== null ? now - reconciliation.checkedAt : null;
  const fresh = ageMs !== null ? ageMs <= input.reconciliationMaxAgeMs : null;
  const consistent = reconciliation?.consistent ?? null;

  const reconciliationOk =
    !required || (reconciliation !== null && consistent === true && fresh === true);

  return {
    ok: input.scanStatus === "ALIVE" && reconciliationOk,
    reconciliation: {
      required,
      consistent,
      fresh,
      lastCheckedAgoMs: ageMs,
    },
  };
}

/** Batas umur rekonsiliasi (ms) -- selaras dengan gerbang BUY di trading/live.ts. */
export function getReconciliationMaxAgeMs(
  env: Readonly<Record<string, string | undefined>> = process.env,
): number {
  return (Number(env.BOT_CANARY_RECONCILIATION_MAX_AGE_MINUTES) || 15) * 60_000;
}
