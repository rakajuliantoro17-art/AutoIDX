/**
==========================================================
AURA Trade OS
AI Market Analyzer
Version : 0.1.0 Alpha
==========================================================
*/

import {
  AIAnalysis,
  AIRequest,
  TradingSignal,
} from "../types";

export class AIAnalyzer {

  /**
   * Analyze market condition
   */
  async analyze(
    request: AIRequest
  ): Promise<AIAnalysis> {

    const {
      featureVector,
      context,
    } = request;

    let score = 50;

    const reasoning: string[] = [];

    const risks: string[] = [];

    /**
     * EMA Trend
     */
    if (
      featureVector.emaFast >
      featureVector.emaSlow
    ) {

      score += 15;

      reasoning.push(
        "EMA Fast berada di atas EMA Slow."
      );

    } else {

      score -= 15;

      risks.push(
        "EMA menunjukkan tren bearish."
      );

    }

    /**
     * RSI
     */
    if (
      featureVector.rsi < 35
    ) {

      score += 10;

      reasoning.push(
        "RSI berada pada area oversold."
      );

    } else if (
      featureVector.rsi > 70
    ) {

      score -= 10;

      risks.push(
        "RSI berada pada area overbought."
      );

    }

    /**
     * ADX
     */
    if (
      featureVector.adx >= 25
    ) {

      score += 10;

      reasoning.push(
        "ADX menunjukkan tren cukup kuat."
      );

    } else {

      risks.push(
        "Kekuatan tren masih lemah."
      );

    }

    /**
     * MACD
     */
    if (
      featureVector.macd >
      featureVector.macdSignal
    ) {

      score += 10;

      reasoning.push(
        "MACD bullish crossover."
      );

    } else {

      score -= 5;

      risks.push(
        "MACD masih bearish."
      );

    }

    /**
     * Trend
     */
    switch (context.trend) {

      case "BULLISH":

        score += 10;

        reasoning.push(
          "Market berada dalam tren bullish."
        );

        break;

      case "BEARISH":

        score -= 10;

        risks.push(
          "Market sedang bearish."
        );

        break;

      default:

        reasoning.push(
          "Market sedang sideways."
        );

    }

    /**
     * Liquidity
     */
    if (
      context.liquidity ===
      "HIGH"
    ) {

      score += 5;

      reasoning.push(
        "Likuiditas tinggi."
      );

    }

    /**
     * Volatility
     */
    if (
      context.volatility ===
      "HIGH"
    ) {

      risks.push(
        "Volatilitas tinggi."
      );

    }

    /**
     * Clamp Score
     */
    score = Math.max(
      0,
      Math.min(100, score)
    );

    /**
     * Signal
     */
    let signal: TradingSignal;

    if (score >= 85) {

      signal = "STRONG_BUY";

    } else if (score >= 70) {

      signal = "BUY";

    } else if (score >= 40) {

      signal = "HOLD";

    } else if (score >= 20) {

      signal = "SELL";

    } else {

      signal = "STRONG_SELL";

    }

    /**
     * Recommendation
     */
    const recommendation =
      this.buildRecommendation(
        signal
      );

    /**
     * Summary
     */
    const summary =
      `${context.trend} market dengan confidence ${score}%.`;

    return {

      signal,

      confidence: score,

      summary,

      reasoning,

      risks,

      recommendation,

      timestamp:
        new Date().toISOString(),

    };

  }

  /**
   * Recommendation Builder
   */
  private buildRecommendation(
    signal: TradingSignal
  ): string {

    switch (signal) {

      case "STRONG_BUY":

        return "Momentum sangat baik. Layak dipertimbangkan untuk entry.";

      case "BUY":

        return "Sinyal beli cukup kuat dengan risiko yang masih terkendali.";

      case "HOLD":

        return "Belum ada konfirmasi kuat. Sebaiknya menunggu.";

      case "SELL":

        return "Mulai pertimbangkan pengurangan posisi.";

      case "STRONG_SELL":

        return "Risiko tinggi. Hindari entry baru atau evaluasi posisi yang ada.";

      default:

        return "Tidak ada rekomendasi.";

    }

  }

}

const aiAnalyzer =
  new AIAnalyzer();

export default aiAnalyzer;
