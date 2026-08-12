/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 7
 * Execution Preflight
 * ==========================================================
 */

export interface PreflightRequest {
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly quantity: number;
  readonly price: number;
  readonly balance: number;
  readonly maxTradeAmount: number;
  readonly minTradeAmount: number;
}

export interface PreflightResult {
  readonly passed: boolean;
  readonly checks: readonly string[];
  readonly failures: readonly string[];
}

export class ExecutionPreflight {

  evaluate(
    request: PreflightRequest,
  ): PreflightResult {

    const checks: string[] = [];
    const failures: string[] = [];

    if (
      request.symbol.trim()
    ) {
      checks.push(
        "symbol-valid",
      );
    } else {
      failures.push(
        "Invalid symbol.",
      );
    }

    if (
      request.quantity > 0
    ) {
      checks.push(
        "quantity-valid",
      );
    } else {
      failures.push(
        "Quantity must be greater than zero.",
      );
    }

    if (
      request.price > 0
    ) {
      checks.push(
        "price-valid",
      );
    } else {
      failures.push(
        "Price must be greater than zero.",
      );
    }

    const orderValue =
      request.quantity *
      request.price;

    if (
      orderValue >=
      request.minTradeAmount
    ) {
      checks.push(
        "minimum-trade-value",
      );
    } else {
      failures.push(
        "Trade value below minimum.",
      );
    }

    if (
      orderValue <=
      request.maxTradeAmount
    ) {
      checks.push(
        "maximum-trade-value",
      );
    } else {
      failures.push(
        "Trade value exceeds maximum.",
      );
    }

    if (
      request.side === "BUY" &&
      orderValue > request.balance
    ) {
      failures.push(
        "Insufficient balance.",
      );
    }

    return {
      passed:
        failures.length === 0,

      checks,

      failures,
    };
  }
}
