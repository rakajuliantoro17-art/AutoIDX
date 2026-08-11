export type LiveTradingMode = "LIVE";

export interface LiveTradingConfig {
  readonly mode: LiveTradingMode;
  readonly enabled: boolean;
  readonly initialLiveApproval: boolean;
  readonly maxOrderNotional: number;
  readonly minOrderNotional: number;
  readonly maxPositionSize: number;
  readonly maxDailyLoss: number;
  readonly maxOpenOrders: number;
  readonly orderTimeoutMs: number;
  readonly reconciliationIntervalMs: number;
  readonly killSwitchEnabled: boolean;
  readonly dryRun: boolean;
}

export function createLiveTradingConfig(input: Partial<LiveTradingConfig> = {}): LiveTradingConfig {
  const config: LiveTradingConfig = Object.freeze({
    mode: "LIVE",
    enabled: input.enabled ?? false,
    initialLiveApproval: input.initialLiveApproval ?? false,
    maxOrderNotional: input.maxOrderNotional ?? 2_500_000,
    minOrderNotional: input.minOrderNotional ?? 10_000,
    maxPositionSize: input.maxPositionSize ?? 0.25,
    maxDailyLoss: input.maxDailyLoss ?? 0.03,
    maxOpenOrders: input.maxOpenOrders ?? 1,
    orderTimeoutMs: input.orderTimeoutMs ?? 15_000,
    reconciliationIntervalMs: input.reconciliationIntervalMs ?? 30_000,
    killSwitchEnabled: input.killSwitchEnabled ?? true,
    dryRun: input.dryRun ?? false,
  });
  if (config.maxOrderNotional < config.minOrderNotional) throw new Error("maxOrderNotional must be >= minOrderNotional");
  if (config.maxPositionSize <= 0 || config.maxPositionSize > 1) throw new Error("maxPositionSize must be in (0,1]");
  if (config.maxDailyLoss <= 0 || config.maxDailyLoss > 1) throw new Error("maxDailyLoss must be in (0,1]");
  if (config.maxOpenOrders < 1 || config.orderTimeoutMs <= 0) throw new Error("Invalid live trading limits");
  return config;
}
