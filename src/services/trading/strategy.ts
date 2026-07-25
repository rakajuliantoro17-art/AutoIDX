/**
==========================================================
AURA Trade OS
Trading Strategy Service
Version : 0.0.6 Alpha
==========================================================
*/

import DecisionEngine, {
  DecisionResult,
} from "./decision";

export interface StrategyInput {

  pair: string;

  price: number;

  rsi: number;

  emaFast: number;

  emaSlow: number;

  inPosition: boolean;

}

export interface StrategyResult extends DecisionResult {

  pair: string;

  trend: "BULLISH" | "BEARISH" | "SIDEWAYS";

  strategy: string;

  indicators: {

    rsi: number;

    emaFast: number;

    emaSlow: number;

  };

}

class TradingStrategy {

  /**
   * Menjalankan strategi utama
   */
  evaluate(
    input: StrategyInput
  ): StrategyResult {

    const trend = this.detectTrend(

      input.emaFast,

      input.emaSlow

    );

    const decision = DecisionEngine.evaluate({

      price: input.price,

      rsi: input.rsi,

      emaFast: input.emaFast,

      emaSlow: input.emaSlow,

      inPosition: input.inPosition,

    });

    return {

      pair: input.pair,

      strategy: "EMA + RSI",

      trend,

      signal: decision.signal,

      confidence: decision.confidence,

      reason: decision.reason,

      indicators: {

        rsi: input.rsi,

        emaFast: input.emaFast,

        emaSlow: input.emaSlow,

      },

    };

  }

  /**
   * Deteksi trend EMA
   */
  detectTrend(

    emaFast: number,

    emaSlow: number

  ): "BULLISH" | "BEARISH" | "SIDEWAYS" {

    const tolerance =

      emaSlow * 0.001;

    if (

      emaFast >

      emaSlow + tolerance

    ) {

      return "BULLISH";

    }

    if (

      emaFast <

      emaSlow - tolerance

    ) {

      return "BEARISH";

    }

    return "SIDEWAYS";

  }

  /**
   * Golden Cross
   */
  isGoldenCross(

    emaFast: number,

    emaSlow: number

  ): boolean {

    return emaFast > emaSlow;

  }

  /**
   * Death Cross
   */
  isDeathCross(

    emaFast: number,

    emaSlow: number

  ): boolean {

    return emaFast < emaSlow;

  }

  /**
   * Oversold RSI
   */
  isOversold(
    rsi: number
  ): boolean {

    return rsi <= 30;

  }

  /**
   * Overbought RSI
   */
  isOverbought(
    rsi: number
  ): boolean {

    return rsi >= 70;

  }

  /**
   * Market Strength (0 - 100)
   */
  calculateStrength(

    rsi: number,

    emaFast: number,

    emaSlow: number

  ): number {

    let score = 50;

    if (

      emaFast > emaSlow

    ) {

      score += 20;

    } else {

      score -= 20;

    }

    if (rsi <= 30) {

      score += 20;

    }

    if (rsi >= 70) {

      score -= 20;

    }

    return Math.max(

      0,

      Math.min(100, score)

    );

  }

}

const tradingStrategy =

new TradingStrategy();

export default tradingStrategy;
