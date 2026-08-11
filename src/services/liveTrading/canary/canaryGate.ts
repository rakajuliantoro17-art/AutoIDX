/**
 * ==========================================================
 * AutoIDX — Canary Gate
 * Phase 38
 * ==========================================================
 *
 * Final boundary immediately before live execution.
 *
 * IMPORTANT:
 * A rejected decision MUST NEVER reach the exchange
 * execution layer.
 * ==========================================================
 */

import {
  CanaryContext,
} from "./canaryContext";

import {
  CanaryConfig,
} from "./canaryConfig";

import {
  CanaryDecision,
  approveCanary,
  rejectCanary,
} from "./canaryDecision";

export class CanaryGate {
  public constructor(
    private readonly config: CanaryConfig,
  ) {}

  public evaluate(
    context: CanaryContext,
  ): CanaryDecision {
    if (!this.config.enabled) {
      return rejectCanary(
        context.sessionId,
        "CANARY_DISABLED",
        "Canary trading is disabled.",
      );
    }

    if (
      !Number.isFinite(context.orderValueIdr) ||
      context.orderValueIdr <= 0
    ) {
      return rejectCanary(
        context.sessionId,
        "INVALID_ORDER_VALUE",
        "Order value must be greater than zero.",
      );
    }

    if (
      context.orderValueIdr >
      this.config.maxOrderValueIdr
    ) {
      return rejectCanary(
        context.sessionId,
        "ORDER_VALUE_LIMIT",
        "Order value exceeds the canary limit.",
      );
    }

    if (
      context.ordersExecutedThisSession >=
      this.config.maxOrdersPerSession
    ) {
      return rejectCanary(
        context.sessionId,
        "SESSION_ORDER_LIMIT",
        "Canary session order limit has been reached.",
      );
    }

    if (
      context.dailyOrderValueIdr +
        context.orderValueIdr >
      this.config.maxDailyOrderValueIdr
    ) {
      return rejectCanary(
        context.sessionId,
        "DAILY_ORDER_VALUE_LIMIT",
        "Daily canary order value limit would be exceeded.",
      );
    }

    if (
      context.dailyLossIdr >=
      this.config.maxDailyLossIdr
    ) {
      return rejectCanary(
        context.sessionId,
        "DAILY_LOSS_LIMIT",
        "Daily loss limit has been reached.",
      );
    }

    if (
      context.openOrders >=
      this.config.maxOpenOrders
    ) {
      return rejectCanary(
        context.sessionId,
        "OPEN_ORDER_LIMIT",
        "Maximum open canary orders has been reached.",
      );
    }

    if (
      this.config.requireHealthyExchange &&
      !context.exchangeHealthy
    ) {
      return rejectCanary(
        context.sessionId,
        "EXCHANGE_UNHEALTHY",
        "Exchange health check failed.",
      );
    }

    if (
      this.config.requireHealthyRuntime &&
      !context.runtimeHealthy
    ) {
      return rejectCanary(
        context.sessionId,
        "RUNTIME_UNHEALTHY",
        "Runtime health check failed.",
      );
    }

    if (
      this.config.requireReconciliation &&
      !context.reconciliationHealthy
    ) {
      return rejectCanary(
        context.sessionId,
        "RECONCILIATION_REQUIRED",
        "Reconciliation is not healthy.",
      );
    }

    if (
      this.config.requireReconciliation &&
      context.lastReconciliationAt !== undefined
    ) {
      const age =
        Date.now() -
        context.lastReconciliationAt;

      if (
        age >
        this.config.maxReconciliationAgeMs
      ) {
        return rejectCanary(
          context.sessionId,
          "RECONCILIATION_STALE",
          "Last reconciliation result is stale.",
        );
      }
    }

    if (
      context.side === "BUY" &&
      !this.config.allowBuy
    ) {
      return rejectCanary(
        context.sessionId,
        "BUY_DISABLED",
        "Canary BUY orders are disabled.",
      );
    }

    if (
      context.side === "SELL" &&
      !this.config.allowSell
    ) {
      return rejectCanary(
        context.sessionId,
        "SELL_DISABLED",
        "Canary SELL orders are disabled.",
      );
    }

    if (!context.safetyApproved) {
      return rejectCanary(
        context.sessionId,
        "SAFETY_REJECTED",
        "Safety layer rejected the order.",
      );
    }

    if (!context.riskApproved) {
      return rejectCanary(
        context.sessionId,
        "RISK_REJECTED",
        "Risk layer rejected the order.",
      );
    }

    return approveCanary(
      context.sessionId,
    );
  }
}
