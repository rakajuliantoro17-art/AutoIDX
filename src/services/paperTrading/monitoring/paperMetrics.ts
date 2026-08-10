/**
 * AURA Trade OS — Phase 35
 */
import type { PaperSnapshot } from "../portfolio/paperSnapshot";
import type { PaperTradeRecord } from "./paperTradeLog";

export interface PaperMetrics {
  readonly totalTrades: number;
  readonly winningTrades: number;
  readonly losingTrades: number;
  readonly winRate: number;
  readonly totalReturn: number;
  readonly totalReturnPercent: number;
  readonly maxDrawdownPercent: number;
  readonly profitFactor: number;
}

export function calculatePaperMetrics(
  initialCapital: number,
  snapshots: readonly PaperSnapshot[],
  trades: readonly PaperTradeRecord[],
): PaperMetrics {
  const finalEquity = snapshots.at(-1)?.equity ?? initialCapital;
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const profit = wins.reduce((s, t) => s + t.pnl, 0);
  const loss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));

  let peak = initialCapital;
  let maxDD = 0;
  for (const s of snapshots) {
    peak = Math.max(peak, s.equity);
    if (peak > 0) maxDD = Math.max(maxDD, (peak - s.equity) / peak);
  }

  return {
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: trades.length ? wins.length / trades.length : 0,
    totalReturn: finalEquity - initialCapital,
    totalReturnPercent: initialCapital ? (finalEquity - initialCapital) / initialCapital : 0,
    maxDrawdownPercent: maxDD,
    profitFactor: loss ? profit / loss : profit > 0 ? Infinity : 0,
  };
}
