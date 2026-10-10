/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 7
 * Dry Run Controller
 * ==========================================================
 */

import {
  ExecutionSimulation,
} from "./executionSimulation";

import {
  ExecutionPreflight,
} from "./executionPreflight";

export interface DryRunRequest {
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly quantity: number;
  readonly price: number;
  readonly balance: number;
  readonly maxTradeAmount: number;
  readonly minTradeAmount: number;
  readonly feePercent: number;
}

export class DryRunController {

  private readonly simulation =
    new ExecutionSimulation();

  private readonly preflight =
    new ExecutionPreflight();

  async run(
    request: DryRunRequest,
  ) {

    const preflight =
      this.preflight.evaluate(
        request,
      );

    if (!preflight.passed) {
      return {
        approved: false,
        preflight,
        simulation: null,
      };
    }

    const simulation =
      this.simulation.simulate({
        symbol:
          request.symbol,

        side:
          request.side,

        quantity:
          request.quantity,

        price:
          request.price,

        feePercent:
          request.feePercent,
      });

    return {
      approved: true,
      preflight,
      simulation,
    };
  }
}
