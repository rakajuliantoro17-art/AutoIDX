/**
==========================================================
AURA Trade OS
Audit Trail (Firestore `audit_logs`, server-only)
==========================================================
Mencatat SIAPA mengubah APA dan KAPAN untuk perubahan sensitif:
settings trading, kontrol bot (mode/emergency stop/priority
pairs), dan akun Indodax.

Prinsip:
- Best-effort: gagal menulis audit TIDAK boleh menggagalkan
  operasi utama (dibungkus try/catch, tidak pernah throw).
- Tidak pernah menyimpan secret (apiKey/secretKey/token);
  field sensitif diganti "[REDACTED]".
- Hanya field yang BERUBAH yang dicatat (before -> after).
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

export const AUDIT_COLLECTION = "audit_logs";

export type AuditAction =
  | "settings.update"
  | "bot_control.update"
  | "indodax_account.create"
  | "indodax_account.update"
  | "indodax_account.delete"
  | "indodax_trade_test.run";

export interface AuditChange {
  field: string;
  before: unknown;
  after: unknown;
}

export interface AuditEntry {
  action: AuditAction;
  actor: string;
  changes: AuditChange[];
  meta?: Record<string, unknown>;
  at: number;
}

const SENSITIVE = /(secret|apikey|api_key|token|password|private)/i;

function sanitize(field: string, value: unknown): unknown {
  if (SENSITIVE.test(field)) return "[REDACTED]";
  if (value === undefined) return null;
  return value;
}

function same(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Pure: bandingkan field yang dikirim (`next`) dengan kondisi
 * sebelumnya (`before`). Hanya field yang berubah dikembalikan.
 */
export function diffFields(
  before: Record<string, unknown> | null | undefined,
  next: Record<string, unknown>
): AuditChange[] {
  const changes: AuditChange[] = [];
  for (const key of Object.keys(next)) {
    const b = before ? before[key] : undefined;
    const a = next[key];
    if (a === undefined || same(b, a)) continue;
    changes.push({ field: key, before: sanitize(key, b), after: sanitize(key, a) });
  }
  return changes;
}

/** Tulis audit entry. Tidak pernah throw. */
export async function recordAudit(
  action: AuditAction,
  actor: string,
  changes: AuditChange[],
  meta?: Record<string, unknown>
): Promise<void> {
  try {
    const entry: AuditEntry = {
      action,
      actor,
      changes,
      at: Date.now(),
      ...(meta ? { meta } : {}),
    };
    await adminDb.collection(AUDIT_COLLECTION).add(entry);
  } catch (error) {
    console.error("[AUDIT] gagal menulis audit log:", error);
  }
}

export async function getRecentAudit(limit = 50): Promise<AuditEntry[]> {
  const n = Math.min(Math.max(Math.floor(limit) || 50, 1), 200);
  const snap = await adminDb
    .collection(AUDIT_COLLECTION)
    .orderBy("at", "desc")
    .limit(n)
    .get();
  return snap.docs.map((d) => d.data() as AuditEntry);
}
