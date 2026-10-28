/**
 * Reservasi slot BUY (live) -- mencegah balapan pada batas Max Open Position.
 *
 * Cron memproses tiap pair di invocation terpisah dan SERENTAK. Batas posisi
 * dihitung dari bot_state, tetapi bot_state baru ditulis SETELAH order selesai,
 * jadi beberapa BUY dalam satu siklus semuanya melihat hitungan lama dan lolos
 * (28 Okt 13.10: ZEREBRO, BIRB, DOT dalam 7 dtk padahal batas 2). Klaim slot
 * ditulis atomik (transaksi Firestore) SEBELUM order dikirim dan dilepas setelah
 * bot_state ditulis; klaim kedaluwarsa otomatis (TTL) bila BUY gagal/crash.
 */
import { adminDb } from "@/services/firebase/admin";

export const SLOT_TTL_MS = 120_000;
const COLLECTION = "bot_control";
const DOC_ID = "buy_slots";

export interface SlotPlan {
  granted: boolean;
  claims: Record<string, number>;
  held: number;
}

/** Murni: putuskan apakah `pair` boleh mengklaim slot. */
export function planSlotClaim(input: {
  claims: Record<string, number>;
  now: number;
  pair: string;
  openCount: number;
  max: number;
  ttlMs?: number;
}): SlotPlan {
  const live: Record<string, number> = {};
  for (const [pair, exp] of Object.entries(input.claims)) {
    if (Number.isFinite(exp) && exp > input.now) live[pair] = exp;
  }
  const others = Object.keys(live).filter((p) => p !== input.pair).length;
  const held = input.openCount + others;
  if (held >= input.max) return { granted: false, claims: live, held };
  live[input.pair] = input.now + (input.ttlMs ?? SLOT_TTL_MS);
  return { granted: true, claims: live, held };
}

export async function claimBuySlot(
  pair: string,
  openCount: number,
  max: number
): Promise<{ granted: boolean; held: number; error?: string }> {
  try {
    const ref = adminDb.collection(COLLECTION).doc(DOC_ID);
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const claims = (snap.exists ? (snap.data()?.claims ?? {}) : {}) as Record<string, number>;
      const plan = planSlotClaim({ claims, now: Date.now(), pair, openCount, max });
      if (plan.granted) tx.set(ref, { claims: plan.claims, updatedAt: Date.now() });
      return { granted: plan.granted, held: plan.held };
    });
  } catch (error) {
    // Fail-closed: tidak bisa memastikan slot -> jangan BUY.
    return { granted: false, held: -1, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function releaseBuySlot(pair: string): Promise<void> {
  try {
    const ref = adminDb.collection(COLLECTION).doc(DOC_ID);
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return;
      const claims = { ...((snap.data()?.claims ?? {}) as Record<string, number>) };
      delete claims[pair];
      tx.set(ref, { claims, updatedAt: Date.now() });
    });
  } catch {
    // Klaim akan kedaluwarsa sendiri (TTL).
  }
}
