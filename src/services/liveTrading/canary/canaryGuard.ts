/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 9
 * Canary Guard
 * ==========================================================
 */

import type {
  CanaryConfig,
} from "./canaryConfig";

export interface CanaryRequest {
  readonly symbol: string;
  readonly orderValue: number;
}

export class CanaryGuard {

  private ordersExecuted = 0;

  constructor(
    private readonly config:
      CanaryConfig,
  ) {}

  approve(
    request: CanaryRequest,
  ): void {

    if (!this.config.enabled) {
      throw new Error(
        "Canary trading is disabled.",
      );
    }

    if (
      !this.config.allowedSymbols.includes(
        request.symbol
          .trim()
          .toLowerCase(),
      )
    ) {
      throw new Error(
        `Symbol ${request.symbol} is not allowed for canary trading.`,
      );
    }

    if (
      request.orderValue >
      this.config.maxOrderValueIdr
    ) {
      throw new Error(
        "Canary order exceeds maximum order value.",
      );
    }

    if (
      this.ordersExecuted >=
      this.config.maxOrdersPerSession
    ) {
      throw new Error(
        "Canary session order limit reached.",
      );
    }
  }

  markSubmitted(): void {
    this.ordersExecuted += 1;
  }

  getOrdersExecuted(): number {
    return this.ordersExecuted;
  }

  reset(): void {
    this.ordersExecuted = 0;
  }
}
