import type {
  ReconciliationConfig,
} from "./reconciliationConfig";

import type {
  ReconciliationContext,
} from "./reconciliationContext";

import type {
  ReconciliationMismatch,
  ReconciliationResult,
} from "./reconciliationResult";

function calculateMismatch(
  local: number,
  exchange: number,
): number {
  const denominator = Math.max(
    Math.abs(local),
    Math.abs(exchange),
    1e-12,
  );

  return (
    Math.abs(local - exchange) /
    denominator
  );
}

export class ReconciliationEngine {
  constructor(
    private readonly config: ReconciliationConfig,
  ) {}

  compare(
    context: ReconciliationContext,
  ): ReconciliationResult {
    const mismatches:
      ReconciliationMismatch[] = [];

    for (const balance of context.balances) {
      const difference =
        calculateMismatch(
          balance.local,
          balance.exchange,
        );

      if (
        difference >
        this.config.tolerancePct
      ) {
        mismatches.push({
          type: "BALANCE",
          key: balance.asset,
          local: balance.local,
          exchange: balance.exchange,
          message:
            `Balance mismatch for ${balance.asset}`,
        });
      }
    }

    for (const position of context.positions) {
      const difference =
        calculateMismatch(
          position.localQuantity,
          position.exchangeQuantity,
        );

      if (
        difference >
        this.config.tolerancePct
      ) {
        mismatches.push({
          type: "POSITION",
          key: position.symbol,
          local: position.localQuantity,
          exchange:
            position.exchangeQuantity,
          message:
            `Position mismatch for ${position.symbol}`,
        });
      }
    }

    for (
      const orderId
      of context.unknownOrderIds
    ) {
      mismatches.push({
        type: "ORDER",
        key: orderId,
        message:
          `Unknown order requires reconciliation: ${orderId}`,
      });
    }

    return Object.freeze({
      consistent:
        mismatches.length === 0,

      mismatches,

      reconciledAt: Date.now(),
    });
  }
}
