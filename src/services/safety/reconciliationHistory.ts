/**
 * Kapan perubahan status rekonsiliasi layak masuk riwayat (fungsi murni).
 * Hanya TRANSISI yang dicatat (konsisten <-> tidak, atau jumlah selisih
 * berubah), bukan tiap siklus -- riwayat tetap kecil dan hemat tulis.
 */
export interface ReconStatusLike {
  consistent: boolean;
  mismatchCount: number;
}

export function shouldRecordHistory(prev: ReconStatusLike | null, next: ReconStatusLike): boolean {
  if (!prev) return true;
  return prev.consistent !== next.consistent || prev.mismatchCount !== next.mismatchCount;
}
