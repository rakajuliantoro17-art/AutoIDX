export interface SafetyConfig {
  readonly maxDailyLossPct: number;
  readonly maxBalanceMismatchPct: number;
  readonly maxPositionMismatchPct: number;
  readonly maxUnknownOrders: number;
  readonly maxConsecutiveExecutionErrors: number;
  readonly staleOrderMs: number;
  readonly reconciliationIntervalMs: number;
  readonly requireManualRecovery: boolean;
  readonly failClosed: boolean;
}

export function createSafetyConfig(
  input: Partial<SafetyConfig> = {},
): SafetyConfig {
  const config: SafetyConfig = Object.freeze({
    maxDailyLossPct: input.maxDailyLossPct ?? 0.03,
    maxBalanceMismatchPct: input.maxBalanceMismatchPct ?? 0.01,
    maxPositionMismatchPct: input.maxPositionMismatchPct ?? 0.01,
    maxUnknownOrders: input.maxUnknownOrders ?? 0,
    maxConsecutiveExecutionErrors:
      input.maxConsecutiveExecutionErrors ?? 3,
    staleOrderMs: input.staleOrderMs ?? 60_000,
    reconciliationIntervalMs:
      input.reconciliationIntervalMs ?? 30_000,
    requireManualRecovery:
      input.requireManualRecovery ?? true,
    failClosed: input.failClosed ?? true,
  });

  if (
    config.maxDailyLossPct <= 0 ||
    config.maxDailyLossPct > 1
  ) {
    throw new Error("Invalid maxDailyLossPct");
  }

  if (
    config.maxBalanceMismatchPct < 0 ||
    config.maxBalanceMismatchPct > 1
  ) {
    throw new Error("Invalid maxBalanceMismatchPct");
  }

  if (
    config.maxPositionMismatchPct < 0 ||
    config.maxPositionMismatchPct > 1
  ) {
    throw new Error("Invalid maxPositionMismatchPct");
  }

  if (config.maxUnknownOrders < 0) {
    throw new Error("Invalid maxUnknownOrders");
  }

  if (config.maxConsecutiveExecutionErrors < 1) {
    throw new Error(
      "Invalid maxConsecutiveExecutionErrors",
    );
  }

  if (
    config.staleOrderMs <= 0 ||
    config.reconciliationIntervalMs <= 0
  ) {
    throw new Error("Invalid safety timing configuration");
  }

  return config;
}
