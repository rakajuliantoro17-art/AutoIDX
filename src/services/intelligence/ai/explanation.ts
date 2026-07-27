/**
==========================================================
AURA Trade OS
AI Explanation Engine
Version : 0.1.0 Alpha
==========================================================
*/

import {
  AIAnalysis,
  FeatureVector,
  FusionDecision,
  MarketContext,
} from "../types";

export interface DecisionExplanation {

  title: string;

  summary: string;

  confidence: number;

  signal: string;

  strengths: string[];

  weaknesses: string[];

  warnings: string[];

  recommendation: string;

  timestamp: string;

}

export class AIExplanationEngine {

  build(

    features: FeatureVector,

    context: MarketContext,

    analysis: AIAnalysis,

    decision?: FusionDecision

  ): DecisionExplanation {

    const strengths: string[] = [];

    const weaknesses: string[] = [];

    const warnings: string[] = [];

    /**
     * EMA
     */

    if (features.emaFast > features.emaSlow) {

      strengths.push(
        "EMA Fast berada di atas EMA Slow (tren bullish)."
      );

    } else {

      weaknesses.push(
        "EMA Fast masih berada di bawah EMA Slow."
      );

    }

    /**
     * RSI
     */

    if (features.rsi < 30) {

      strengths.push(
        "RSI berada di area oversold."
      );

    }

    if (features.rsi > 70) {

      warnings.push(
        "RSI berada di area overbought."
      );

    }

    /**
     * MACD
     */

    if (features.macd > features.macdSignal) {

      strengths.push(
        "MACD menunjukkan momentum bullish."
      );

    } else {

      weaknesses.push(
        "MACD masih bearish."
      );

    }

    /**
     * ADX
     */

    if (features.adx >= 25) {

      strengths.push(
        "ADX menunjukkan tren yang kuat."
      );

    } else {

      warnings.push(
        "ADX masih rendah sehingga tren belum kuat."
      );

    }

    /**
     * Trend
     */

    switch (context.trend) {

      case "BULLISH":

        strengths.push(
          "Market berada dalam tren bullish."
        );

        break;

      case "BEARISH":

        warnings.push(
          "Market masih bearish."
        );

        break;

      default:

        warnings.push(
          "Market sedang sideways."
        );

    }

    /**
     * Liquidity
     */

    if (context.liquidity === "HIGH") {

      strengths.push(
        "Likuiditas tinggi."
      );

    }

    if (context.liquidity === "LOW") {

      warnings.push(
        "Likuiditas rendah."
      );

    }

    /**
     * Volatility
     */

    if (context.volatility === "HIGH") {

      warnings.push(
        "Volatilitas tinggi."
      );

    }

    const signal =
      decision?.finalSignal ??
      analysis.signal;

    const confidence =
      decision?.confidence ??
      analysis.confidence;

    const summary =
      this.buildSummary(
        signal,
        confidence
      );

    return {

      title:
        "Market Decision Analysis",

      summary,

      confidence,

      signal,

      strengths,

      weaknesses,

      warnings,

      recommendation:
        analysis.recommendation,

      timestamp:
        new Date().toISOString(),

    };

  }

  private buildSummary(

    signal: string,

    confidence: number

  ): string {

    switch (signal) {

      case "STRONG_BUY":

        return `Sistem memberikan sinyal STRONG BUY dengan confidence ${confidence}%.`;

      case "BUY":

        return `Sistem memberikan sinyal BUY dengan confidence ${confidence}%.`;

      case "SELL":

        return `Sistem memberikan sinyal SELL dengan confidence ${confidence}%.`;

      case "STRONG_SELL":

        return `Sistem memberikan sinyal STRONG SELL dengan confidence ${confidence}%.`;

      default:

        return `Belum terdapat konfirmasi kuat. Confidence ${confidence}%.`;

    }

  }

}

const aiExplanation =
  new AIExplanationEngine();

export default aiExplanation;
