/**
==========================================================
AURA Trade OS
Market Momentum Engine
Version : 0.1.0 Alpha
==========================================================
*/

import {
  FeatureVector,
  MarketMomentum,
} from "../types";

export interface MomentumResult {

  level: MarketMomentum;

  score: number;

  description: string;

}

export class MomentumEngine {

  /**
   * Calculate Market Momentum
   */
  calculate(
    features: FeatureVector
  ): MomentumResult {

    let score = 50;

    /**
     * MACD
     */

    if (
      features.macd >
      features.macdSignal
    ) {

      score += 15;

    } else {

      score -= 15;

    }

    /**
     * Histogram
     */

    if (
      features.macdHistogram > 0
    ) {

      score += 10;

    } else {

      score -= 10;

    }

    /**
     * RSI
     */

    if (
      features.rsi >= 50 &&
      features.rsi <= 70
    ) {

      score += 10;

    }

    if (
      features.rsi > 75
    ) {

      score -= 10;

    }

    if (
      features.rsi < 30
    ) {

      score -= 5;

    }

    /**
     * Stochastic
     */

    if (
      features.stochasticK >
      features.stochasticD
    ) {

      score += 10;

    } else {

      score -= 10;

    }

    /**
     * ADX
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

    let level: MarketMomentum;

    let description: string;

    if (score >= 80) {

      level = "STRONG";

      description =
        "Momentum sangat kuat dan mendukung kelanjutan tren.";

    } else if (score >= 50) {

      level = "NORMAL";

      description =
        "Momentum masih cukup sehat.";

    } else {

      level = "WEAK";

      description =
        "Momentum melemah dan berpotensi terjadi pembalikan.";

    }

    return {

      level,

      score,

      description,

    };

  }

}

const marketMomentum =
  new MomentumEngine();

export default marketMomentum;
