/**
==========================================================
AURA Trade OS
Trading Decision Engine
Version : 0.0.6 Alpha
==========================================================
*/

import type { TradeSignal } from "./types";

export interface DecisionInput {
  price: number;

  rsi: number;

  emaFast: number;

  emaSlow: number;

  inPosition: boolean;
}

export interface DecisionResult {
  signal: TradeSignal;

  confidence: number;

  reason: string;
}

export class DecisionEngine {

  /**
   * Analisis indikator dan menghasilkan keputusan trading.
   */
  static evaluate(
    input: DecisionInput
  ): DecisionResult {

    const {
      rsi,
      emaFast,
      emaSlow,
      inPosition,
    } = input;

    const bullishCross = emaFast > emaSlow;
    const bearishCross = emaFast < emaSlow;

    /**
     * BUY
     */
    if (
      !inPosition &&
      bullishCross &&
      rsi <= 35
    ) {

      return {
        signal: "BUY",
        confidence: this.calculateConfidence(
          rsi,
          bullishCross,
          false
        ),
        reason:
          "Bullish EMA crossover dengan RSI oversold.",
      };

    }

    /**
     * SELL
     */
    if (
      inPosition &&
      bearishCross &&
      rsi >= 65
    ) {

      return {
        signal: "SELL",
        confidence: this.calculateConfidence(
          rsi,
          false,
          true
        ),
        reason:
          "Bearish EMA crossover dengan RSI overbought.",
      };

    }

    /**
     * HOLD
     */
    return {

      signal: "HOLD",

      confidence: this.calculateHoldConfidence(
        rsi
      ),

      reason:
        "Belum terdapat konfirmasi sinyal yang cukup kuat.",

    };

  }

  /**
   * Confidence BUY / SELL
   */
  private static calculateConfidence(
    rsi: number,
    bullish: boolean,
    bearish: boolean
  ): number {

    let score = 0.5;

    if (bullish) score += 0.20;

    if (bearish) score += 0.20;

    if (rsi <= 30) score += 0.20;

    if (rsi >= 70) score += 0.20;

    return Number(
      Math.min(score, 1)
        .toFixed(2)
    );

  }

  /**
   * Confidence HOLD
   */
  private static calculateHoldConfidence(
    rsi: number
  ): number {

    let confidence = 0.50;

    if (rsi > 40 && rsi < 60) {

      confidence = 0.80;

    }

    return Number(
      confidence.toFixed(2)
    );

  }

}

export default DecisionEngine;
