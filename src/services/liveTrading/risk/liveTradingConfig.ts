/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 8
 * Live Trading Safety Configuration
 * ==========================================================
 */

export interface LiveTradingConfig {
  readonly enabled: boolean;
  readonly canaryOnly: boolean;
  readonly maxTradeAmount: number;
  readonly maxDailyLoss: number;
  readonly maxOpenOrders: number;
  readonly maxConsecutiveFailures: number;
  readonly requireReconciliation: boolean;
}

const numberEnv = (
  key: string,
  fallback: number,
): number => {

  const value =
    Number(
      process.env[key],
    );

  return Number.isFinite(value)
    ? value
    : fallback;
};

export function getLiveTradingConfig():
  LiveTradingConfig {

  return {
    enabled:
      process.env.BOT_LIVE_ENABLED ===
      "true",

    canaryOnly:
      process.env.BOT_CANARY_ONLY !==
      "false",

    maxTradeAmount:
      numberEnv(
        "BOT_MAX_TRADE_AMOUNT",
        25000,
      ),

    maxDailyLoss:
      numberEnv(
        "BOT_MAX_DAILY_LOSS",
        50000,
      ),

    maxOpenOrders:
      numberEnv(
        "BOT_MAX_OPEN_ORDERS",
        1,
      ),

    maxConsecutiveFailures:
      numberEnv(
        "BOT_MAX_CONSECUTIVE_FAILURES",
        3,
      ),

    requireReconciliation:
      process.env.BOT_REQUIRE_RECONCILIATION !==
      "false",
  };
}
