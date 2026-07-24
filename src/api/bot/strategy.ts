/**
==========================================================
AURA Trade OS
Strategy Engine
Version : 0.0.1 Alpha
==========================================================
*/

import { STRATEGY } from "./constants";

export type Signal =
  | "BUY"
  | "SELL"
  | "HOLD";

export interface MarketData {

  pair: string;

  price: number;

  emaFast: number;

  emaSlow: number;

  rsi: number;

}

export interface StrategyResult {

  signal: Signal;

  confidence: number;

  reason: string;

}

export function analyzeStrategy(
  market: MarketData
): StrategyResult {

  /**
   * BUY
   */

  if (
    market.emaFast > market.emaSlow &&
    market.rsi <= STRATEGY.RSI_BUY
  ) {

    return {

      signal: "BUY",

      confidence: 80,

      reason:
        "EMA bullish crossover with RSI confirmation."

    };

  }

  /**
   * SELL
   */

  if (
    market.emaFast < market.emaSlow &&
    market.rsi >= STRATEGY.RSI_SELL
  ) {

    return {

      signal: "SELL",

      confidence: 80,

      reason:
        "EMA bearish crossover with RSI confirmation."

    };

  }

  /**
   * HOLD
   */

  return {

    signal: "HOLD",

    confidence: 50,

    reason:
      "No valid trading signal."

  };

}
