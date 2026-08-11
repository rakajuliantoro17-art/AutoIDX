import type { SafetyContext } from "./safetyContext";
import type { SafetyDecision } from "./safetyDecision";
import { SafetyGate } from "./safetyGate";

export type SafetyStatus =
  | "SAFE"
  | "HALTED"
  | "MANUAL_RECOVERY";

export class SafetyManager {
  private status: SafetyStatus = "SAFE";

  private lastDecision?: SafetyDecision;

  constructor(
    private readonly gate: SafetyGate,
  ) {}

  evaluate(
    context: SafetyContext,
  ): SafetyDecision {
    const decision =
      this.gate.evaluate(context);

    this.lastDecision = decision;

    if (
      decision.action === "ALLOW"
    ) {
      this.status = "SAFE";
    } else if (
      decision.action === "MANUAL_RECOVERY"
    ) {
      this.status = "MANUAL_RECOVERY";
    } else {
      this.status = "HALTED";
    }

    return decision;
  }

  recover(
    operator: string,
  ): void {
    if (!operator.trim()) {
      throw new Error(
        "Recovery operator is required",
      );
    }

    this.status = "SAFE";
  }

  canTrade(): boolean {
    return this.status === "SAFE";
  }

  getStatus(): SafetyStatus {
    return this.status;
  }

  snapshot() {
    return Object.freeze({
      status: this.status,
      lastDecision: this.lastDecision,
    });
  }
}
