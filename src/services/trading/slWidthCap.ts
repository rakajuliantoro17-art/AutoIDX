/**
==========================================================
AURA Trade OS
Batas lebar Stop Loss saat entry (eksperimen v4)
==========================================================
SL ATR = 1,5 x ATR% (maks 8%). Pada order tetap Rp15.000, SL 7% berarti rugi ~Rp1.050
vs ~Rp300 pada SL 2%. Fungsi ini memblokir BUY pair yang SL aktualnya lebih lebar dari
batas. Env BOT_MAX_ENTRY_SL_PERCENT (default 3; 0 = nonaktif).
==========================================================
*/

export const DEFAULT_MAX_ENTRY_SL_PERCENT = 3;

export function resolveMaxEntrySlPercent(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return DEFAULT_MAX_ENTRY_SL_PERCENT;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_MAX_ENTRY_SL_PERCENT;
  return n;
}

export interface SlWidthCheck {
  ok: boolean;
  slPercent: number;
  maxPercent: number;
  /** Perkiraan rugi kotor (Rp) bila SL kena. */
  lossAtStopIdr: number;
}

export function checkSlWidthCap(slPercent: number, tradeAmountIdr: number, maxPercent: number): SlWidthCheck {
  const lossAtStopIdr = Math.round((tradeAmountIdr * slPercent) / 100);
  if (!(maxPercent > 0)) return { ok: true, slPercent, maxPercent, lossAtStopIdr };
  // toleransi kecil agar 3.0000001 akibat pembulatan tidak memblokir
  return { ok: slPercent <= maxPercent + 1e-9, slPercent, maxPercent, lossAtStopIdr };
}
