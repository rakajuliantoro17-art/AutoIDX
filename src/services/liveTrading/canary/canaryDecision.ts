/**
 * ==========================================================
 * AutoIDX — Canary Decision
 * Phase 38
 * ==========================================================
 */

export type CanaryDecisionStatus =
  | "APPROVED"
  | "REJECTED";

export type CanaryRejectReason =
  | "CANARY_DISABLED"
  | "INVALID_ORDER_VALUE"
  | "ORDER_VALUE_LIMIT"
  | "SESSION_ORDER_LIMIT"
  | "DAILY_ORDER_VALUE_LIMIT"
  | "DAILY_LOSS_LIMIT"
  | "OPEN_ORDER_LIMIT"
  | "EXCHANGE_UNHEALTHY"
  | "RUNTIME_UNHEALTHY"
  | "RECONCILIATION_REQUIRED"
  | "RECONCILIATION_STALE"
  | "SAFETY_REJECTED"
  | "RISK_REJECTED"
  | "BUY_DISABLED"
  | "SELL_DISABLED";

export interface CanaryDecision {
  status: CanaryDecisionStatus;

  approved: boolean;

  reason?: CanaryRejectReason;

  message: string;

  sessionId: string;

  timestamp: number;
}

export const approveCanary = (
  sessionId: string,
): CanaryDecision => ({
  status: "APPROVED",
  approved: true,
  message: "Canary order approved.",
  sessionId,
  timestamp: Date.now(),
});

export const rejectCanary = (
  sessionId: string,
  reason: CanaryRejectReason,
  message: string,
): CanaryDecision => ({
  status: "REJECTED",
  approved: false,
  reason,
  message,
  sessionId,
  timestamp: Date.now(),
});
