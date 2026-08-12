/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 9
 * Canary Executor
 * ==========================================================
 */

import type {
  ExchangeClient,
} from "../exchange/exchangeClient";

import type {
  ExchangeOrderRequest,
} from "../exchange/exchangeOrder";

import {
  CanaryGuard,
} from "./canaryGuard";

import type {
  CanaryResult,
} from "./canaryResult";

export class CanaryExecutor {

  constructor(
    private readonly exchange:
      ExchangeClient,

    private readonly guard:
      CanaryGuard,
  ) {}

  async execute(
    request: ExchangeOrderRequest,
  ): Promise<CanaryResult> {

    const orderValue =
      request.side === "BUY" &&
      request.quoteAmount
        ? request.quoteAmount
        : request.quantity;

    try {

      this.guard.approve({
        symbol:
          request.symbol,

        orderValue,
      });

      const order =
        await this.exchange.submitOrder(
          request,
        );

      this.guard.markSubmitted();

      return {
        status:
          order.status === "UNKNOWN"
            ? "UNCERTAIN"
            : "SUCCESS",

        symbol:
          request.symbol,

        orderId:
          order.id,

        message:
          "Canary order submitted successfully.",

        timestamp:
          Date.now(),
      };

    } catch (error) {

      return {
        status:
          "FAILED",

        symbol:
          request.symbol,

        message:
          error instanceof Error
            ? error.message
            : "Unknown canary execution error.",

        timestamp:
          Date.now(),
      };
    }
  }
}
