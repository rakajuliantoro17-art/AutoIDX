/**
==========================================================
AURA Trade OS
Daftar pair untuk dropdown dashboard (MURNI)
==========================================================
Sebelumnya dropdown memakai SEMUA dokumen bot_state (termasuk pair lama yang
sudah tidak diproses), sehingga tidak sama dengan Trading Pair Universe.
Sekarang: watchlist saat ini + posisi terbuka (pair yang memang dikelola bot).
Bila keduanya kosong -> fallback (instalasi baru).
==========================================================
*/
export function selectDisplayPairs(watchlist: string[] | undefined, openPairs: string[], fallback: string[]): string[] {
  const norm = (p: string) => p.trim().toLowerCase();
  const set = new Set<string>();
  for (const p of [...(watchlist ?? []), ...openPairs]) {
    const n = norm(p);
    if (n) set.add(n);
  }
  const out = [...set].sort();
  return out.length > 0 ? out : fallback.map(norm).filter(Boolean).sort();
}
