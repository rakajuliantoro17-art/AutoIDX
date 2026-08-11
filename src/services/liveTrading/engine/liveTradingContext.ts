import type { LiveTradingConfig } from "./liveTradingConfig";

export type LiveSignal = "BUY" | "SELL" | "HOLD";

export interface LiveTradingContext {
  readonly config: LiveTradingConfig;
  readonly symbol: string;
  readonly signal: LiveSignal;
  readonly quantity: number;
  readonly referencePrice: number;
  readonly timestamp: number;
}
