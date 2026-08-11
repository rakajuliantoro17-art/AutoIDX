import type { LiveTradingConfig } from "./liveTradingConfig";
import type { LiveSignal } from "./liveTradingContext";
import { LiveOrderGate } from "../gate/liveOrderGate";
import { LiveOrderExecutor } from "../execution/liveOrderExecutor";
import type { ExchangeOrder } from "../exchange/exchangeOrder";

export interface LiveSignalRequest {
  readonly symbol: string;
  readonly signal: LiveSignal;
  readonly quantity: number;
  readonly referencePrice: number;
}

export class LiveTradingRunner {
  constructor(
    private readonly config: LiveTradingConfig,
    private readonly gate: LiveOrderGate,
    private readonly executor: LiveOrderExecutor,
  ) {}

  async process(request: LiveSignalRequest): Promise<{
    status: "SUBMITTED" | "REJECTED" | "UNKNOWN" | "BLOCKED";
    order?: ExchangeOrder;
    reason?: string;
  }> {
    const gateResult = this.gate.check({
      symbol: request.symbol,
      signal: request.signal,
      quantity: request.quantity,
      referencePrice: request.referencePrice,
      timestamp: Date.now(),
      config: this.config,
    });
    if (!gateResult.allowed) return { status: "BLOCKED", reason: gateResult.reason };
    return this.executor.execute({
      symbol: request.symbol,
      side: request.signal,
      quantity: request.quantity,
      referencePrice: request.referencePrice,
    });
  }
}
