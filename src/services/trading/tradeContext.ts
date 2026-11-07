/**
==========================================================
AURA Trade OS
Konteks trade untuk fase belajar (MURNI, tidak mengubah perilaku)
==========================================================
Mencatat KONDISI saat entry (ATR%, RSI, SL%, TP%) dan ALASAN + hasil saat
exit (STOP_LOSS / TAKE_PROFIT / SIGNAL, PnL% kotor, lama ditahan) agar pola
SL bisa dianalisis dengan data, bukan perkiraan. Tidak pernah melempar error.
==========================================================
*/

export interface EntryContext {
  atrPercent: number;
  slPercent: number;
  tpPercent: number;
  rsi: number;
  enteredAtMs: number;
}

export type ExitReason = "STOP_LOSS" | "TAKE_PROFIT" | "SIGNAL";

const num = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const r2 = (n: number) => Number(n.toFixed(2));

export function buildEntryContext(i: {
  entryPrice: number;
  atr: number;
  rsi: number;
  slPercent: number;
  tpPercent: number;
  nowMs: number;
}): EntryContext {
  const atrPct = i.entryPrice > 0 && Number.isFinite(i.atr) ? (i.atr / i.entryPrice) * 100 : 0;
  return {
    atrPercent: r2(atrPct),
    slPercent: r2(num(i.slPercent) ?? 0),
    tpPercent: r2(num(i.tpPercent) ?? 0),
    rsi: r2(num(i.rsi) ?? 0),
    enteredAtMs: i.nowMs,
  };
}

/** Konteks yang disimpan di dokumen trade SELL (field `ctx`). Nilai datar (aman untuk Firestore). */
export function buildExitContext(i: {
  exitReason: ExitReason;
  entryPrice: number;
  exitPrice: number;
  entryContext?: Partial<EntryContext> | null;
  nowMs: number;
}): Record<string, number | string> {
  const out: Record<string, number | string> = { exitReason: i.exitReason };
  if (i.entryPrice > 0 && i.exitPrice > 0) out.pnlPercent = r2((i.exitPrice / i.entryPrice - 1) * 100);
  const e = i.entryContext;
  if (e) {
    for (const k of ["atrPercent", "slPercent", "tpPercent", "rsi"] as const) {
      const v = num(e[k]);
      if (v !== undefined) out[`entry_${k}`] = v;
    }
    const at = num(e.enteredAtMs);
    if (at && at > 0 && i.nowMs >= at) out.heldMinutes = Math.round((i.nowMs - at) / 60000);
  }
  return out;
}
