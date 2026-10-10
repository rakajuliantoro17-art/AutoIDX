/**
 * ==========================================================
 * AutoIDX — Execution Reconciliation
 * Phase 38 / Batch 4
 * ==========================================================
 */

import {
  ReconciliationResult,
} from "./reconciliationResult";

export interface LocalExecutionSnapshot {
  readonly orderId: string;

  readonly exchangeOrderId?: string;

  readonly status?: string;

  readonly executed?: number;

  readonly remaining?: number;
}

export interface ExchangeExecutionSnapshot {
  readonly orderId?: string;

  readonly status?: string;

  readonly executed?: number;

  readonly remaining?: number;
}

const normalize = (
  value: unknown,
): string =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const numbersEqual = (
  a?: number,
  b?: number,
): boolean => {
  if (
    typeof a !== "number" ||
    typeof b !== "number"
  ) {
    return true;
  }

  return Math.abs(a - b) < 1e-12;
};

export class ExecutionReconciliation {
  public reconcile(
    local: LocalExecutionSnapshot,
    exchange: ExchangeExecutionSnapshot,
  ): ReconciliationResult {
    const timestamp = Date.now();

    if (
      !exchange.orderId
    ) {
      return {
        status: "UNKNOWN",
        localOrderId:
          local.orderId,
        exchangeOrderId:
          local.exchangeOrderId,
        localStatus:
          local.status,
        localExecuted:
          local.executed,
        localRemaining:
          local.remaining,
        reason:
          "Exchange order identifier is missing.",
        timestamp,
      };
    }

    const localStatus =
      normalize(local.status);

    const exchangeStatus =
      normalize(exchange.status);

    const statusMatch =
      !localStatus ||
      !exchangeStatus ||
      localStatus === exchangeStatus;

    const executedMatch =
      numbersEqual(
        local.executed,
        exchange.executed,
      );

    const remainingMatch =
      numbersEqual(
        local.remaining,
        exchange.remaining,
      );

    if (
      statusMatch &&
      executedMatch &&
      remainingMatch
    ) {
      return {
        status:
          exchangeStatus ===
            "partial" ||
          exchangeStatus ===
            "partially_filled"
            ? "PARTIAL"
            : "MATCHED",

        localOrderId:
          local.orderId,

        exchangeOrderId:
          exchange.orderId,

        localStatus:
          local.status,

        exchangeStatus:
          exchange.status,

        localExecuted:
          local.executed,

        exchangeExecuted:
          exchange.executed,

        localRemaining:
          local.remaining,

        exchangeRemaining:
          exchange.remaining,

        timestamp,
      };
    }

    return {
      status: "MISMATCH",

      localOrderId:
        local.orderId,

      exchangeOrderId:
        exchange.orderId,

      localStatus:
        local.status,

      exchangeStatus:
        exchange.status,

      localExecuted:
        local.executed,

      exchangeExecuted:
        exchange.executed,

      localRemaining:
        local.remaining,

      exchangeRemaining:
        exchange.remaining,

      reason:
        "Local execution state differs from exchange state.",

      timestamp,
    };
  }
}
