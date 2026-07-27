/**
==========================================================
AURA Trade OS
AI Confidence Engine
Version : 0.1.0 Alpha
==========================================================
*/

import {
  AIAnalysis,
  FeatureVector,
  MarketContext,
} from "../types";

export interface ConfidenceBreakdown {

  indicator: number;

  context: number;

  ai: number;

  risk: number;

  total: number;

}

export class AIConfidenceEngine {

  /**
   * Calculate Final Confidence
   */
  calculate(

    features: FeatureVector,

    context: MarketContext,

    analysis: AIAnalysis

  ): ConfidenceBreakdown {

    const indicator =
      this.calculateIndicatorScore(
        features
      );

    const contextScore =
      this.calculateContextScore(
        context
      );

    const ai =
      Math.max(
        0,
        Math.min(
          100,
          analysis.confidence
        )
      );

    const risk =
      this.calculateRiskScore(
        features,
        context
      );

    /**
     * Weighted Score
     */

    const total = Math.round(

      indicator * 0.40 +

      contextScore * 0.25 +

      ai * 0.25 +

      risk * 0.10

    );

    return {

      indicator,

      context: contextScore,

      ai,

      risk,

      total,

    };

  }

  /**
   * Indicator Quality
   */
  private calculateIndicatorScore(

    f: FeatureVector

  ): number {

    let score = 50;

    if (
      f.emaFast >
      f.emaSlow
    ) {

      score += 15;

    }

    if (
      f.macd >
      f.macdSignal
    ) {

      score += 10;

    }

    if (
      f.adx >= 25
    ) {

      score += 10;

    }

    if (
      f.rsi >= 30 &&
      f.rsi <= 65
    ) {

      score += 10;

    }

    return Math.max(
      0,
      Math.min(100, score)
    );

  }

  /**
   * Market Context
   */
  private calculateContextScore(

    context: MarketContext

  ): number {

    let score = context.confidence;

    switch (
      context.trend
    ) {

      case "BULLISH":

        score += 10;

        break;

      case "BEARISH":

        score -= 10;

        break;

    }

    switch (
      context.liquidity
    ) {

      case "HIGH":

        score += 5;

        break;

      case "LOW":

        score -= 5;

        break;

    }

    return Math.max(
      0,
      Math.min(100, score)
    );

  }

  /**
   * Risk Score
   * Semakin tinggi semakin aman
   */
  private calculateRiskScore(

    features: FeatureVector,

    context: MarketContext

  ): number {

    let score = 80;

    if (
      context.volatility ===
      "HIGH"
    ) {

      score -= 20;

    }

    if (
      features.rsi > 75
    ) {

      score -= 15;

    }

    if (
      features.adx < 20
    ) {

      score -= 10;

    }

    return Math.max(
      0,
      Math.min(100, score)
    );

  }

}

const aiConfidence =
  new AIConfidenceEngine();

export default aiConfidence;
