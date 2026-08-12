/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 7
 * Execution Simulation
 * ==========================================================
 */

export interface SimulationRequest {
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly quantity: number;
  readonly price: number;
  readonly feePercent: number;
}

export interface SimulationResult {
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly quantity: number;
  readonly price: number;
  readonly grossValue: number;
  readonly estimatedFee: number;
  readonly estimatedNetValue: number;
  readonly simulatedAt: number;
}

export class ExecutionSimulation {

  simulate(
    request: SimulationRequest,
  ): SimulationResult {

    if (
      request.quantity <= 0 ||
      request.price <= 0
    ) {
      throw new Error(
        "Invalid simulation quantity or price.",
      );
    }

    const grossValue =
      request.quantity *
      request.price;

    const estimatedFee =
      grossValue *
      (request.feePercent / 100);

    return {
      symbol:
        request.symbol,

      side:
        request.side,

      quantity:
        request.quantity,

      price:
        request.price,

      grossValue,

      estimatedFee,

      estimatedNetValue:
        grossValue -
        estimatedFee,

      simulatedAt:
        Date.now(),
    };
  }
}
