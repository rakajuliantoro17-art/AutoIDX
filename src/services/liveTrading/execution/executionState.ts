/**
 * ==========================================================
 * AutoIDX — Live Execution State
 * Phase 38 / Batch 3
 * ==========================================================
 */

export type ExecutionState =
  | "CREATED"
  | "VALIDATING"
  | "APPROVED"
  | "SUBMITTING"
  | "SUBMITTED"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCEL_PENDING"
  | "CANCELLED"
  | "REJECTED"
  | "UNKNOWN"
  | "FAILED";

const TRANSITIONS: Record<
  ExecutionState,
  readonly ExecutionState[]
> = {
  CREATED: [
    "VALIDATING",
    "REJECTED",
    "FAILED",
  ],

  VALIDATING: [
    "APPROVED",
    "REJECTED",
    "FAILED",
  ],

  APPROVED: [
    "SUBMITTING",
    "REJECTED",
    "FAILED",
  ],

  SUBMITTING: [
    "SUBMITTED",
    "UNKNOWN",
    "REJECTED",
    "FAILED",
  ],

  SUBMITTED: [
    "PARTIALLY_FILLED",
    "FILLED",
    "CANCEL_PENDING",
    "UNKNOWN",
    "FAILED",
  ],

  PARTIALLY_FILLED: [
    "PARTIALLY_FILLED",
    "FILLED",
    "CANCEL_PENDING",
    "UNKNOWN",
    "FAILED",
  ],

  CANCEL_PENDING: [
    "CANCELLED",
    "FILLED",
    "UNKNOWN",
    "FAILED",
  ],

  FILLED: [],

  CANCELLED: [],

  REJECTED: [],

  UNKNOWN: [
    "SUBMITTED",
    "PARTIALLY_FILLED",
    "FILLED",
    "CANCELLED",
    "FAILED",
  ],

  FAILED: [],
};

export class ExecutionStateMachine {
  private state:
    ExecutionState =
    "CREATED";

  public getState(): ExecutionState {
    return this.state;
  }

  public canTransition(
    next: ExecutionState,
  ): boolean {
    return TRANSITIONS[
      this.state
    ].includes(next);
  }

  public transition(
    next: ExecutionState,
  ): void {
    if (
      !this.canTransition(next)
    ) {
      throw new Error(
        `Invalid execution transition: ${this.state} -> ${next}`,
      );
    }

    this.state = next;
  }

  public isTerminal(): boolean {
    return (
      this.state === "FILLED" ||
      this.state === "CANCELLED" ||
      this.state === "REJECTED" ||
      this.state === "FAILED"
    );
  }

  public isUnknown(): boolean {
    return (
      this.state === "UNKNOWN"
    );
  }
}
