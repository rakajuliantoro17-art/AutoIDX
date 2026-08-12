/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 9
 * Canary Result
 * ==========================================================
 */

export type CanaryStatus =
  | "NOT_STARTED"
  | "BLOCKED"
  | "SUBMITTED"
  | "SUCCESS"
  | "FAILED"
  | "UNCERTAIN";

export interface CanaryResult {
  readonly status: CanaryStatus;
  readonly symbol: string;
  readonly orderId?: string;
  readonly message: string;
  readonly timestamp: number;
}

export function canarySucceeded(
  result: CanaryResult,
): boolean {
  return result.status === "SUCCESS";
}

export function canaryFailed(
  result: CanaryResult,
): boolean {
  return (
    result.status === "FAILED" ||
    result.status === "UNCERTAIN"
  );
}
