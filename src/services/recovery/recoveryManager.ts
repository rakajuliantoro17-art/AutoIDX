import type {
  RecoverySnapshot,
} from "./recoveryState";

export class RecoveryManager {
  private state: RecoverySnapshot = {
    state: "NORMAL",
    timestamp: Date.now(),
  };

  halt(
    reason: string,
  ): void {
    this.state = Object.freeze({
      state: "HALTED",
      reason,
      timestamp: Date.now(),
    });
  }

  beginReconciliation(
    reason = "Safety recovery",
  ): void {
    this.state = Object.freeze({
      state: "RECONCILING",
      reason,
      timestamp: Date.now(),
    });
  }

  requireManualReview(
    reason: string,
  ): void {
    this.state = Object.freeze({
      state: "MANUAL_REVIEW",
      reason,
      timestamp: Date.now(),
    });
  }

  recover(
    operator: string,
  ): void {
    if (!operator.trim()) {
      throw new Error(
        "Recovery operator is required",
      );
    }

    this.state = Object.freeze({
      state: "RECOVERED",
      operator,
      timestamp: Date.now(),
    });
  }

  snapshot(): RecoverySnapshot {
    return this.state;
  }

  canTrade(): boolean {
    return (
      this.state.state === "NORMAL" ||
      this.state.state === "RECOVERED"
    );
  }
}
