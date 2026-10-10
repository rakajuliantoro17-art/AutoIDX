/**
 * ==========================================================
 * AutoIDX — Reconciliation Guard
 * Phase 38 / Batch 4
 * ==========================================================
 */

import {
  ReconciliationResult,
  requiresManualReview,
} from "./reconciliationResult";

export class ReconciliationGuard {
  public canCreateReplacementOrder(
    result: ReconciliationResult,
  ): boolean {
    if (
      requiresManualReview(result)
    ) {
      return false;
    }

    return (
      result.status === "MATCHED" ||
      result.status === "PARTIAL"
    );
  }

  public requiresReconciliation(
    result: ReconciliationResult,
  ): boolean {
    return (
      result.status === "UNKNOWN" ||
      result.status === "MISMATCH"
    );
  }
}
