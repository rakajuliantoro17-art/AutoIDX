/**
 * Keputusan batas rugi harian (fungsi murni, tanpa Firebase, mudah diuji).
 *
 * Aturan fail-closed: kalau status rugi harian TIDAK bisa dibaca (mis. kuota
 * Firestore habis) dan bot berjalan live, BUY baru diblokir. Sebelumnya
 * kegagalan baca dianggap "rugi 0" sehingga batas rugi diam-diam mati.
 * Paper tidak diblokir karena tidak ada dana nyata.
 */
export interface DailyLossInput {
  dailyPnlIdr: number;
  /** true bila pembacaan risk_state gagal dan nilai di atas hanya default. */
  readFailed?: boolean;
  maxDailyLossPercent: number;
  startingBalance: number;
  live: boolean;
}

export interface DailyLossDecision {
  blocked: boolean;
  reason: "OK" | "LIMIT_REACHED" | "STATE_UNREADABLE";
  maxDailyLossIdr: number;
}

export function evaluateDailyLoss(input: DailyLossInput): DailyLossDecision {
  const maxDailyLossIdr = (input.maxDailyLossPercent / 100) * input.startingBalance;
  if (input.readFailed && input.live) {
    return { blocked: true, reason: "STATE_UNREADABLE", maxDailyLossIdr };
  }
  if (input.dailyPnlIdr <= -maxDailyLossIdr) {
    return { blocked: true, reason: "LIMIT_REACHED", maxDailyLossIdr };
  }
  return { blocked: false, reason: "OK", maxDailyLossIdr };
}
