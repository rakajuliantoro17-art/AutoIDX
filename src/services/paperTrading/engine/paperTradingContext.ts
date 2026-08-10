/**
 * AURA Trade OS — Phase 35
 */
import type { MarketTick } from "../market/marketTick";
import type { PaperTradingConfig } from "./paperTradingConfig";
import type { PaperPortfolio } from "../portfolio/paperPortfolio";

export type PaperSignal = "BUY" | "SELL" | "HOLD";

export interface PaperStrategyInput {
  readonly tick: MarketTick;
  readonly history: readonly MarketTick[];
  readonly portfolio: PaperPortfolio;
}

export interface PaperStrategy {
  evaluate(input: PaperStrategyInput): Promise<PaperSignal> | PaperSignal;
}

export interface PaperTradingContext {
  readonly config: PaperTradingConfig;
  readonly portfolio: PaperPortfolio;
  readonly tick: MarketTick;
  readonly history: readonly MarketTick[];
}
