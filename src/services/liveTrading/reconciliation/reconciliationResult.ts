/**
 * ==========================================================
 * AutoIDX — Reconciliation Result
 * Phase 38 / Batch 4
 * ==========================================================
 */

export type ReconciliationStatus =
  | "MATCHED"
  | "PARTIAL"
  | "MISSING"
  | "MISMATCH"
  | "UNKNOWN";

export interface ReconciliationResult {
  readonly status: ReconciliationStatus;

  readonly localOrderId: string;

  readonly exchangeOrderId?: string;

  readonly localStatus?: string;

  readonly exchangeStatus?: string;

  readonly localExecuted?: number;

  readonly exchangeExecuted?: number;

  readonly localRemaining?: number;

  readonly exchangeRemaining?: number;

  readonly reason?: string;

  readonly timestamp: number;
}

export const isReconciled = (
  result: ReconciliationResult,
): boolean =>
  result.status === "MATCHED" ||
  result.status === "PARTIAL";

export const requiresManualReview = (
  result: ReconciliationResult,
): boolean =>
  result.status === "MISMATCH" ||
  result.status === "UNKNOWN";
