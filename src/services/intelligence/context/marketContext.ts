/**
==========================================================
AURA Trade OS
Market Context Engine
Version : 0.1.0 Alpha
==========================================================
*/

import {
  FeatureVector,
  LiquidityLevel,
  MarketContext,
  MarketMomentum,
  MarketTrend,
  MarketVolatility,
} from "../types";

import marketLiquidity from "./liquidity";
import marketMomentum from "./momentum";
import marketTrend from "./trend";
import marketVolatility from "./volatility";

export interface MarketContextInput {

  pair: string;

  features: FeatureVector;

}

export class MarketContextEngine {

  /**
   * Build complete market context
   */
  build(
    input: MarketContextInput
  ): MarketContext {

    const { pair, features } = input;

    const trend =
      marketTrend.calculate(features);

    const momentum =
      marketMomentum.calculate(features);

    const volatility =
      marketVolatility.calculate(features);

    const liquidity =
      marketLiquidity.calculate({

        volume: features.volume,

      });

    const confidence =
      this.calculateConfidence(
        trend,
        momentum,
        volatility,
        liquidity.level
      );

    return {

      pair,

      trend,

      momentum,

      volatility,

      liquidity: liquidity.level,

      confidence,

      timestamp:
        new Date().toISOString(),

    };

  }

  /**
   * Internal Context Confidence
   */
  private calculateConfidence(

    trend: MarketTrend,

    momentum: MarketMomentum,

    volatility: MarketVolatility,

    liquidity: LiquidityLevel

  ): number {

    let score = 50;

    /**
     * Trend
     */

    switch (trend) {

      case "BULLISH":

        score += 15;

        break;

      case "SIDEWAYS":

        score += 5;

        break;

      case "BEARISH":

        score -= 10;

        break;

    }

    /**
     * Momentum
     */

    switch (momentum) {

      case "STRONG":

        score += 15;

        break;

      case "NORMAL":

        score += 5;

        break;

      case "WEAK":

        score -= 10;

        break;

    }

    /**
     * Liquidity
     */

    switch (liquidity) {

      case "HIGH":

        score += 10;

        break;

      case "MEDIUM":

        score += 5;

        break;

      case "LOW":

        score -= 10;

        break;

    }

    /**
     * Volatility
     */

    switch (volatility) {

      case "LOW":

        score += 10;

        break;

      case "MEDIUM":

        score += 5;

        break;

      case "HIGH":

        score -= 10;

        break;

    }

    return Math.max(
      0,
      Math.min(100, score)
    );

  }

}

const marketContext =
  new MarketContextEngine();

export default marketContext;

