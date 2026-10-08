/**
==========================================================
AURA Trade OS
Backtest Benchmark (Buy & Hold) + Evidence Verdict
==========================================================
Tujuan: strategi long-only hampir selalu terlihat untung di
pasar yang sedang naik. Pembandingnya adalah beli di awal lalu
tahan sampai akhir (dengan fee + slippage yang sama). Strategi
baru dianggap "TERBUKTI" bila positif, mengalahkan buy & hold,
dan punya cukup transaksi.

Murni (tanpa I/O), aman dipakai di serverless.
==========================================================
*/

export interface BenchmarkCandle {
  readonly close: number;
}

export interface BuyAndHoldResult {
  readonly finalCapital: number;
  readonly returnPercent: number;
}

/** Jumlah transaksi minimum agar hasil dianggap punya arti statistik. */
export const MIN_TRADES_FOR_EVIDENCE = 10;

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Beli di close pertama (harga + slippage, bayar fee), jual di close
 * terakhir (harga - slippage, bayar fee). Seluruh modal dipakai.
 */
export function calculateBuyAndHold(
  candles: readonly BenchmarkCandle[],
  initialCapital: number,
  feeRate: number,
  slippage: number,
): BuyAndHoldResult {
  if (candles.length < 2 || !(initialCapital > 0)) {
    return { finalCapital: initialCapital, returnPercent: 0 };
  }
  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  if (!(first > 0) || !(last > 0)) {
    return { finalCapital: initialCapital, returnPercent: 0 };
  }
  const buyPrice = first * (1 + slippage);
  const units = (initialCapital * (1 - feeRate)) / buyPrice;
  const finalCapital = units * last * (1 - slippage) * (1 - feeRate);
  return {
    finalCapital: round2(finalCapital),
    returnPercent: round2(((finalCapital - initialCapital) / initialCapital) * 100),
  };
}

export type EvidenceVerdict =
  | "TERBUKTI"
  | "TIDAK_MENGALAHKAN_BUY_HOLD"
  | "RUGI"
  | "DATA_KURANG";

export interface EvidenceInput {
  readonly strategyReturnPercent: number;
  readonly benchmarkReturnPercent: number;
  readonly totalTrades: number;
}

export interface Evidence {
  readonly verdict: EvidenceVerdict;
  /** Selisih return strategi dikurangi buy & hold (poin persen). */
  readonly excessReturnPercent: number;
}

export function evaluateEvidence(input: EvidenceInput): Evidence {
  const excess = round2(input.strategyReturnPercent - input.benchmarkReturnPercent);
  let verdict: EvidenceVerdict;
  if (input.totalTrades < MIN_TRADES_FOR_EVIDENCE) {
    verdict = "DATA_KURANG";
  } else if (input.strategyReturnPercent <= 0) {
    verdict = "RUGI";
  } else if (excess <= 0) {
    verdict = "TIDAK_MENGALAHKAN_BUY_HOLD";
  } else {
    verdict = "TERBUKTI";
  }
  return { verdict, excessReturnPercent: excess };
}
