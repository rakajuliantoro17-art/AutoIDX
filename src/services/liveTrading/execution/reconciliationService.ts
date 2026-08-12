/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 10
 * Execution Reconciliation Service
 * ==========================================================
 */

import type {
  ExchangeClient,
} from "../exchange/exchangeClient";

import type {
  ExchangeOrder,
} from "../exchange/exchangeOrder";

export interface ReconciliationSnapshot {
  readonly local: ExchangeOrder;
  readonly exchange: ExchangeOrder;
  readonly matched: boolean;
  readonly reason?: string;
  readonly timestamp: number;
}

export class ExecutionReconciliationService {

  constructor(
    private readonly exchange:
      ExchangeClient,
  ) {}

  async reconcile(
    local: ExchangeOrder,
  ): Promise<ReconciliationSnapshot> {

    const exchange =
      await this.exchange.getOrder(
        local.id,
        local.symbol,
      );

    const matched =
      local.id === exchange.id &&
      local.side === exchange.side &&
      local.symbol === exchange.symbol &&
      Math.abs(
        local.filledQuantity -
        exchange.filledQuantity,
      ) < 1e-12;

    return {
      local,
      exchange,
      matched,

      reason:
        matched
          ? undefined
          : "Local execution differs from exchange execution.",

      timestamp:
        Date.now(),
    };
  }
}
