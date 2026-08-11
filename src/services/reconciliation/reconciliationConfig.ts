export interface ReconciliationConfig {
  readonly intervalMs: number;

  readonly orderLookbackMs: number;

  readonly balanceAssets: readonly string[];

  readonly positionSymbols: readonly string[];

  readonly tolerancePct: number;

  readonly haltOnMismatch: boolean;
}

export function createReconciliationConfig(
  input: Partial<ReconciliationConfig> = {},
): ReconciliationConfig {
  const config = Object.freeze({
    intervalMs:
      input.intervalMs ?? 30_000,

    orderLookbackMs:
      input.orderLookbackMs ??
      24 * 60 * 60 * 1000,

    balanceAssets:
      input.balanceAssets ??
      ["idr", "btc"],

    positionSymbols:
      input.positionSymbols ??
      ["btc_idr"],

    tolerancePct:
      input.tolerancePct ?? 0.01,

    haltOnMismatch:
      input.haltOnMismatch ?? true,
  });

  if (
    config.intervalMs <= 0 ||
    config.orderLookbackMs <= 0
  ) {
    throw new Error(
      "Invalid reconciliation timing",
    );
  }

  if (
    config.tolerancePct < 0 ||
    config.tolerancePct > 1
  ) {
    throw new Error(
      "Invalid reconciliation tolerance",
    );
  }

  return config;
}
