/**
 * AURA Trade OS — Phase 35
 * Production-oriented Paper Trading Configuration
 */
export type PaperTradingMode = "PAPER";

export interface PaperTradingConfig {
  readonly mode: PaperTradingMode;
  readonly initialCapital: number;
  readonly feeRate: number;
  readonly slippageRate: number;
  readonly maxPositionSize: number; // fraction of equity, 0..1
  readonly maxDailyLoss: number; // fraction, 0..1
  readonly maxOpenPositions: number;
  readonly allowShort: boolean;
  readonly autoResume: boolean;
  readonly staleMarketMs: number;
  readonly heartbeatTimeoutMs: number;
  readonly maxOrderNotional: number;
  readonly minOrderNotional: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createPaperTradingConfig(input: Partial<PaperTradingConfig> & {
  initialCapital: number;
}): PaperTradingConfig {
  const config: PaperTradingConfig = {
    mode: "PAPER",
    initialCapital: input.initialCapital,
    feeRate: input.feeRate ?? 0.003,
    slippageRate: input.slippageRate ?? 0.001,
    maxPositionSize: input.maxPositionSize ?? 0.25,
    maxDailyLoss: input.maxDailyLoss ?? 0.03,
    maxOpenPositions: input.maxOpenPositions ?? 3,
    allowShort: input.allowShort ?? false,
    autoResume: input.autoResume ?? false,
    staleMarketMs: input.staleMarketMs ?? 15_000,
    heartbeatTimeoutMs: input.heartbeatTimeoutMs ?? 30_000,
    maxOrderNotional: input.maxOrderNotional ?? 2_500_000,
    minOrderNotional: input.minOrderNotional ?? 10_000,
    metadata: input.metadata ?? {},
  };

  if (config.initialCapital <= 0) throw new Error("initialCapital must be > 0");
  if (config.feeRate < 0 || config.slippageRate < 0) throw new Error("fee/slippage cannot be negative");
  if (config.maxPositionSize <= 0 || config.maxPositionSize > 1) throw new Error("maxPositionSize must be in (0,1]");
  if (config.maxDailyLoss <= 0 || config.maxDailyLoss > 1) throw new Error("maxDailyLoss must be in (0,1]");
  if (config.maxOpenPositions < 1) throw new Error("maxOpenPositions must be >= 1");
  if (config.minOrderNotional <= 0 || config.maxOrderNotional < config.minOrderNotional) {
    throw new Error("Invalid order notional limits");
  }
  return Object.freeze(config);
}
