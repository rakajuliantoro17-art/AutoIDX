/**
==========================================================
AURA Trade OS
Market Trend Engine
Version : 0.1.0 Alpha
==========================================================
*/

import {
  FeatureVector,
  MarketTrend,
} from "../types";

export interface TrendResult {

  level: MarketTrend;

  score: number;

  description: string;

}

export class TrendEngine {

  /**
   * Calculate Market Trend
   */
  calculate(
    features: FeatureVector
  ): TrendResult {

    let score = 50;

    /**
     * EMA Cross
     */

    if (
      features.emaFast >
      features.emaSlow
    ) {

      score += 25;

    } else {

      score -= 25;

    }

    /**
     * MACD Direction
     */

    if (
      features.macd >
      features.macdSignal
    ) {

      score += 10;

    } else {

      score -= 10;

    }

    /**
     * Histogram
     */

    if (
      features.macdHistogram > 0
    ) {

      score += 5;

    } else {

      score -= 5;

    }

    /**
     * Price vs EMA Fast
     */

    if (
      features.price >
      features.emaFast
    ) {

      score += 10;

    } else {

      score -= 10;

    }

    /**
     * ADX Confirmation
     */

    if (
      features.adx >= 25
    ) {

      score += 10;

    }

    score = Math.max(
      0,
      Math.min(100, score)
    );

    let level: MarketTrend;

    let description: string;

    if (score >= 70) {

      level = "BULLISH";

      description =
        "Bullish trend terkonfirmasi oleh EMA dan momentum.";

    } else if (score <= 30) {

      level = "BEARISH";

      description =
        "Bearish trend terkonfirmasi oleh EMA dan momentum.";

    } else {

      level = "SIDEWAYS";

      description =
        "Belum ada arah tren yang dominan.";

    }

    return {

      level,

      score,

      description,

    };

  }

}

const marketTrend =
  new TrendEngine();

export default marketTrend;
