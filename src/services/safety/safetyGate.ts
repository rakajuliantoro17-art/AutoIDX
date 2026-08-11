import type { SafetyConfig } from "./safetyConfig";
import type { SafetyContext } from "./safetyContext";
import type { SafetyDecision } from "./safetyDecision";

export class SafetyGate {
  constructor(
    private readonly config: SafetyConfig,
  ) {}

  evaluate(
    context: SafetyContext,
  ): SafetyDecision {
    const reasons: string[] = [];

    if (
      context.dailyPnlPct <=
      -this.config.maxDailyLossPct
    ) {
      reasons.push(
        "Daily loss limit exceeded",
      );
    }

    if (
      context.unknownOrders >
      this.config.maxUnknownOrders
    ) {
      reasons.push(
        "Unknown orders exceed safety limit",
      );
    }

    if (
      context.consecutiveExecutionErrors >=
      this.config.maxConsecutiveExecutionErrors
    ) {
      reasons.push(
        "Consecutive execution errors exceed safety limit",
      );
    }

    if (
      context.balanceMismatchPct >
      this.config.maxBalanceMismatchPct
    ) {
      reasons.push(
        "Balance mismatch exceeds safety limit",
      );
    }

    if (
      context.positionMismatchPct >
      this.config.maxPositionMismatchPct
    ) {
      reasons.push(
        "Position mismatch exceeds safety limit",
      );
    }

    if (context.staleOrders > 0) {
      reasons.push(
        "Stale orders detected",
      );
    }

    if (reasons.length === 0) {
      return Object.freeze({
        action: "ALLOW",
        safe: true,
        reasons,
        timestamp: Date.now(),
      });
    }

    const requiresManualRecovery =
      this.config.requireManualRecovery &&
      (
        context.unknownOrders > 0 ||
        context.balanceMismatchPct >
          this.config.maxBalanceMismatchPct ||
        context.positionMismatchPct >
          this.config.maxPositionMismatchPct
      );

    return Object.freeze({
      action: requiresManualRecovery
        ? "MANUAL_RECOVERY"
        : "HALT",

      safe: false,

      reasons,

      timestamp: Date.now(),
    });
  }
}
