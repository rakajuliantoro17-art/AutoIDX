/**
 * ==========================================================
 * AutoIDX — Canary Trading Configuration
 * Phase 38
 * ==========================================================
 *
 * Safety principle:
 * - Canary trading is OFF by default.
 * - Real trading must be explicitly enabled.
 * - Configuration is immutable after creation.
 * - Secrets MUST NOT be stored here.
 * ==========================================================
 */

export interface CanaryConfig {
  enabled: boolean;

  maxOrdersPerSession: number;

  maxOrderValueIdr: number;

  maxDailyOrderValueIdr: number;

  maxDailyLossIdr: number;

  maxOpenOrders: number;

  requireReconciliation: boolean;

  maxReconciliationAgeMs: number;

  requireHealthyExchange: boolean;

  requireHealthyRuntime: boolean;

  allowBuy: boolean;

  allowSell: boolean;
}

const readBoolean = (
  value: string | undefined,
  fallback: boolean,
): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

const readNumber = (
  value: string | undefined,
  fallback: number,
): number => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

export const createCanaryConfig = (): CanaryConfig => ({
  enabled: readBoolean(
    process.env.AUTOIDX_CANARY_ENABLED,
    false,
  ),

  maxOrdersPerSession: readNumber(
    process.env.AUTOIDX_CANARY_MAX_ORDERS,
    1,
  ),

  maxOrderValueIdr: readNumber(
    process.env.AUTOIDX_CANARY_MAX_ORDER_IDR,
    10_000,
  ),

  maxDailyOrderValueIdr: readNumber(
    process.env.AUTOIDX_CANARY_MAX_DAILY_IDR,
    25_000,
  ),

  maxDailyLossIdr: readNumber(
    process.env.AUTOIDX_CANARY_MAX_DAILY_LOSS_IDR,
    5_000,
  ),

  maxOpenOrders: readNumber(
    process.env.AUTOIDX_CANARY_MAX_OPEN_ORDERS,
    1,
  ),

  requireReconciliation: readBoolean(
    process.env.AUTOIDX_CANARY_REQUIRE_RECONCILIATION,
    true,
  ),

  maxReconciliationAgeMs: readNumber(
    process.env.AUTOIDX_CANARY_RECONCILIATION_MAX_AGE_MS,
    60_000,
  ),

  requireHealthyExchange: readBoolean(
    process.env.AUTOIDX_CANARY_REQUIRE_EXCHANGE_HEALTH,
    true,
  ),

  requireHealthyRuntime: readBoolean(
    process.env.AUTOIDX_CANARY_REQUIRE_RUNTIME_HEALTH,
    true,
  ),

  allowBuy: readBoolean(
    process.env.AUTOIDX_CANARY_ALLOW_BUY,
    false,
  ),

  allowSell: readBoolean(
    process.env.AUTOIDX_CANARY_ALLOW_SELL,
    false,
  ),
});
