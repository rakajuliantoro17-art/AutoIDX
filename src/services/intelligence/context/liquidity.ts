/**
==========================================================
AURA Trade OS
Market Liquidity Engine
Version : 0.1.0 Alpha
==========================================================
*/

import { LiquidityLevel } from "../types";

export interface LiquidityInput {

  /**
   * Base Asset Volume
   */
  volume: number;

  /**
   * Quote Asset Volume (optional)
   */
  quoteVolume?: number;

}

export interface LiquidityResult {

  level: LiquidityLevel;

  score: number;

  description: string;

}

export class LiquidityEngine {

  /**
   * Calculate Market Liquidity
   */
  calculate(
    input: LiquidityInput
  ): LiquidityResult {

    let score = 50;

    const volume =
      Math.max(0, input.volume);

    const quoteVolume =
      Math.max(
        0,
        input.quoteVolume ?? 0
      );

    /**
     * Base Volume Score
     */

    if (volume >= 1000) {

      score += 35;

    } else if (volume >= 500) {

      score += 25;

    } else if (volume >= 100) {

      score += 10;

    } else {

      score -= 20;

    }

    /**
     * Quote Volume Bonus
     */

    if (quoteVolume > 0) {

      if (quoteVolume >= 10_000_000_000) {

        score += 15;

      } else if (quoteVolume >= 1_000_000_000) {

        score += 10;

      } else if (quoteVolume >= 100_000_000) {

        score += 5;

      }

    }

    score = Math.max(
      0,
      Math.min(100, score)
    );

    let level: LiquidityLevel;

    let description: string;

    if (score >= 80) {

      level = "HIGH";

      description =
        "High liquidity. Slippage risk is relatively low.";

    } else if (score >= 50) {

      level = "MEDIUM";

      description =
        "Moderate liquidity. Normal trading conditions.";

    } else {

      level = "LOW";

      description =
        "Low liquidity. Higher slippage risk.";

    }

    return {

      level,

      score,

      description,

    };

  }

}

const marketLiquidity =
  new LiquidityEngine();

export default marketLiquidity;
