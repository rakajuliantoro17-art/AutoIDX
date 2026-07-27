/**
==========================================================
AURA Trade OS
Market Volatility Engine
Version : 0.1.0 Alpha
==========================================================
*/

import {
  FeatureVector,
  MarketVolatility,
} from "../types";

export interface VolatilityResult {

  level: MarketVolatility;

  score: number;

  description: string;

}

export class VolatilityEngine {

  /**
   * Calculate Market Volatility
   */
  calculate(
    features: FeatureVector
  ): VolatilityResult {

    let score = 50;

    /**
     * ATR
     */

    if (features.atr > 0) {

      const atrRatio =
        features.atr /
        features.price;

      if (atrRatio < 0.01) {

        score += 20;

      } else if (atrRatio < 0.02) {

        score += 10;

      } else if (atrRatio > 0.05) {

        score -= 25;

      } else {

        score -= 10;

      }

    }

    /**
     * Bollinger Band Width
     */

    const bandWidth =

      (features.bollingerUpper -

      features.bollingerLower)

      /

      features.bollingerMiddle;

    if (bandWidth < 0.03) {

      score += 15;

    } else if (bandWidth < 0.08) {

      score += 5;

    } else {

      score -= 15;

    }

    /**
     * ADX
     * Trend kuat cenderung lebih stabil
     */

    if (features.adx >= 25) {

      score += 10;

    }

    /**
     * RSI Extreme
     */

    if (

      features.rsi > 80 ||

      features.rsi < 20

    ) {

      score -= 10;

    }

    score = Math.max(
      0,
      Math.min(100, score)
    );

    let level: MarketVolatility;

    let description: string;

    if (score >= 70) {

      level = "LOW";

      description =
        "Volatilitas rendah. Pergerakan harga relatif stabil.";

    } else if (score >= 40) {

      level = "MEDIUM";

      description =
        "Volatilitas sedang. Kondisi pasar normal.";

    } else {

      level = "HIGH";

      description =
        "Volatilitas tinggi. Risiko slippage dan pergerakan ekstrem meningkat.";

    }

    return {

      level,

      score,

      description,

    };

  }

}

const marketVolatility =
  new VolatilityEngine();

export default marketVolatility;
