/**
 * ==========================================================
 * AutoIDX — Execution Verifier
 * Phase 38 / Batch 3
 * ==========================================================
 */

export type VerifiedOrderStatus =
  | "OPEN"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED"
  | "REJECTED"
  | "UNKNOWN";

export interface ExecutionSnapshot {
  orderId?: string;

  status?: string;

  executed?: number;

  remaining?: number;
}

const normalizeStatus = (
  status: unknown,
): string => {
  return String(
    status ?? "",
  )
    .trim()
    .toLowerCase();
};

export const verifyExecutionStatus =
  (
    snapshot: ExecutionSnapshot,
  ): VerifiedOrderStatus => {
    const status =
      normalizeStatus(
        snapshot.status,
      );

    if (
      status === "filled" ||
      status === "closed" ||
      status === "done"
    ) {
      return "FILLED";
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return "CANCELLED";
    }

    if (
      status === "rejected" ||
      status === "failed"
    ) {
      return "REJECTED";
    }

    if (
      status === "partially_filled" ||
      status === "partial"
    ) {
      return "PARTIALLY_FILLED";
    }

    if (
      status === "open" ||
      status === "pending"
    ) {
      return "OPEN";
    }

    if (
      typeof snapshot.executed ===
        "number" &&
      typeof snapshot.remaining ===
        "number"
    ) {
      if (
        snapshot.executed > 0 &&
        snapshot.remaining > 0
      ) {
        return "PARTIALLY_FILLED";
      }

      if (
        snapshot.executed > 0 &&
        snapshot.remaining <= 0
      ) {
        return "FILLED";
      }
    }

    return "UNKNOWN";
  };

export const isConfirmedExecution =
  (
    status: VerifiedOrderStatus,
  ): boolean =>
    status === "FILLED";

export const requiresReconciliation =
  (
    status: VerifiedOrderStatus,
  ): boolean =>
    status === "UNKNOWN";
