/**
 * Peringatan kritis terpusat (Phase 47).
 *
 * - Tercatat sebagai log RISK/danger berawalan "[ALERT:JENIS]" sehingga muncul
 *   di lonceng notifikasi portal (feed.ts menyaring pola ini).
 * - Juga dikirim lewat AutomationNotifier (Telegram bila env diset, selain itu
 *   hanya console).
 * - Pembatas spam: satu peringatan per JENIS per 30 menit per instance, supaya
 *   siklus yang berulang tidak membanjiri log/kuota Firestore.
 * - Best-effort: tidak pernah melempar, tidak boleh mengganggu jalur trading.
 */
import { claimInterval } from "@/lib/cache/interval";
import { recordLog } from "@/services/firebase/logService";
import automationNotifier from "@/services/automation/notifier";

export type AlertKind =
  | "DAILY_LOSS_LIMIT"
  | "ORDER_BREAKER"
  | "ORDER_UNCERTAIN";

export const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

/** Pola yang dikenali lonceng notifikasi. */
export const ALERT_LOG_PATTERN = /\[ALERT:[A-Z_]+\]/;

export function formatAlertMessage(kind: AlertKind, title: string, detail: string): string {
  return `[ALERT:${kind}] ${title} -- ${detail}`;
}

export async function raiseAlert(kind: AlertKind, title: string, detail: string): Promise<void> {
  try {
    if (!claimInterval(`alert:${kind}`, ALERT_COOLDOWN_MS)) return;
    await recordLog("RISK", "danger", formatAlertMessage(kind, title, detail));
    await automationNotifier.error(title, detail);
  } catch (error) {
    console.error("[ALERT] gagal mengirim peringatan:", error);
  }
}
