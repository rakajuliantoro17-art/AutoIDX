/**
==========================================================
AURA Trade OS
Pemilihan akun Indodax aktif (logika murni, tanpa Firestore)
==========================================================
Bot hanya memakai SATU akun pada satu waktu. Aturan:
- Akun aktif dipilih deterministik (createdAt tertua, lalu id) bila
  data lama punya lebih dari satu akun aktif.
- Akun baru hanya aktif bila belum ada akun aktif lain.
- Mengaktifkan satu akun menonaktifkan yang lain.
- Berpindah/menghapus/menonaktifkan akun aktif DIBLOKIR saat live
  masih punya posisi terbuka, atau ada order berstatus TIDAK PASTI
  (UNCERTAIN) -- keduanya terikat ke akun lama sehingga reconcile
  akan membandingkan saldo akun yang salah.
==========================================================
*/

export interface AccountLite {
  id: string;
  isActive: boolean;
  createdAt: number;
}

export function pickActiveAccount<T extends AccountLite>(
  accounts: T[]
): { account: T | null; ambiguous: boolean } {
  const active = accounts
    .filter((a) => a.isActive)
    .sort((a, b) => (a.createdAt - b.createdAt) || a.id.localeCompare(b.id));
  return { account: active[0] ?? null, ambiguous: active.length > 1 };
}

export function activeStateForNewAccount(existing: AccountLite[]): boolean {
  return !existing.some((a) => a.isActive);
}

export type ActivationPlan =
  | { ok: true; updates: { id: string; isActive: boolean }[]; changesActiveAccount: boolean }
  | { ok: false; error: string };

export function planActivation(
  accounts: AccountLite[],
  targetId: string,
  makeActive: boolean
): ActivationPlan {
  if (!accounts.some((a) => a.id === targetId)) {
    return { ok: false, error: "Akun tidak ditemukan." };
  }
  const before = pickActiveAccount(accounts).account?.id ?? null;
  const updates: { id: string; isActive: boolean }[] = [];
  for (const a of accounts) {
    const next = a.id === targetId ? makeActive : makeActive ? false : a.isActive;
    if (next !== a.isActive) updates.push({ id: a.id, isActive: next });
  }
  const after = pickActiveAccount(
    accounts.map((a) => ({ ...a, isActive: updates.find((u) => u.id === a.id)?.isActive ?? a.isActive }))
  ).account?.id ?? null;
  return { ok: true, updates, changesActiveAccount: before !== after };
}

/** Dampak menghapus akun: berubah hanya bila yang dihapus adalah akun yang dipakai bot. */
export function deletionChangesActiveAccount(accounts: AccountLite[], targetId: string): boolean {
  const before = pickActiveAccount(accounts).account?.id ?? null;
  const after = pickActiveAccount(accounts.filter((a) => a.id !== targetId)).account?.id ?? null;
  return before !== after;
}

export function evaluateAccountSwitch(ctx: {
  liveMode: boolean;
  openPositions: number;
  uncertainLocks: number;
}): { allowed: true } | { allowed: false; reason: string } {
  if (ctx.uncertainLocks > 0) {
    return {
      allowed: false,
      reason: `Ada ${ctx.uncertainLocks} order berstatus TIDAK PASTI. Selesaikan dulu (cek riwayat order di Indodax lalu resolve) sebelum mengganti akun.`,
    };
  }
  if (ctx.openPositions >= Number.MAX_SAFE_INTEGER) {
    // getOpenPositionsCount() mengembalikan MAX_SAFE_INTEGER bila gagal membaca.
    return { allowed: false, reason: "Tidak bisa memastikan jumlah posisi terbuka saat ini. Coba lagi sebentar." };
  }
  if (ctx.liveMode && ctx.openPositions > 0) {
    return {
      allowed: false,
      reason: `Mode Live masih punya ${ctx.openPositions} posisi terbuka milik akun saat ini. Tutup posisi (atau pindah ke Paper) sebelum mengganti akun.`,
    };
  }
  return { allowed: true };
}
