/**
 * ==========================================================
 * AutoIDX — Canary Trading Context
 * Phase 38
 * ==========================================================
 */

export type CanarySide = "BUY" | "SELL";

export interface CanaryContext {
  sessionId: string;

  symbol: string;

  side: CanarySide;

  orderValueIdr: number;

  openOrders: number;

  ordersExecutedThisSession: number;

  dailyOrderValueIdr: number;

  dailyLossIdr: number;

  exchangeHealthy: boolean;

  runtimeHealthy: boolean;

  reconciliationHealthy: boolean;

  lastReconciliationAt?: number;

  safetyApproved: boolean;

  riskApproved: boolean;

  clientOrderId?: string;

  timestamp: number;
}

export const createCanaryContext = (
  input: Omit<CanaryContext, "timestamp">,
): CanaryContext => ({
  ...input,
  timestamp: Date.now(),
});
