/**
==========================================================
AURA Trade OS
Market Scanner Filter Engine
Version : 0.0.3 Alpha
==========================================================
*/
import { ScannedPairResult } from "./types";
import { INDICATORS } from "@/config/indicators";

export interface ScannerMetrics {
  rsi: number;
  emaFast: number;
  emaSlow: number;
  volumeIdr: number;
  change24h: number;
}

const { OVERSOLD, OVERBOUGHT } = INDICATORS.RSI;

// Batas "deep" oversold/overbought dihitung proporsional dari config,
// bukan hardcode terpisah — supaya kalau OVERSOLD/OVERBOUGHT diubah di
// indicators.ts, seluruh scoring ikut menyesuaikan otomatis.
const DEEP_OVERSOLD = OVERSOLD - 5;   // default: 30 - 5 = 25
const MILD_OVERSOLD = OVERSOLD + 5;   // default: 30 + 5 = 35
const DEEP_OVERBOUGHT = OVERBOUGHT + 5; // default: 70 + 5 = 75
const MILD_OVERBOUGHT = OVERBOUGHT - 5; // default: 70 - 5 = 65

/**
 * Calculate opportunity score
 *
 * Range:
 * 0 - 100
 */
export function calculateOpportunityScore(metrics: ScannerMetrics): number {
  let score = 50;

  /**
   * RSI Momentum
   */
  if (metrics.rsi <= DEEP_OVERSOLD) {
    score += 25;
  } else if (metrics.rsi <= MILD_OVERSOLD) {
    score += 15;
  } else if (metrics.rsi >= DEEP_OVERBOUGHT) {
    score -= 25;
  } else if (metrics.rsi >= MILD_OVERBOUGHT) {
    score -= 10;
  }

  /**
   * EMA Trend
   */
  if (metrics.emaFast > metrics.emaSlow) {
    score += 20;
  } else {
    score -= 15;
  }

  /**
   * Volume Liquidity
   */
  if (metrics.volumeIdr >= 5_000_000_000) {
    score += 15;
  } else if (metrics.volumeIdr >= 1_000_000_000) {
    score += 8;
  }

  /**
   * Daily Momentum
   */
  if (metrics.change24h > 0 && metrics.change24h < 5) {
    score += 5;
  }
  if (metrics.change24h < -10) {
    score -= 15;
  }

  return Math.min(100, Math.max(0, score));
}

export function deriveSignalRecommendation(score: number): ScannedPairResult["signalRecommendation"] {
  if (score >= 85) return "STRONG_BUY";
  if (score >= 70) return "BUY";
  if (score >= 45) return "WAIT";
  if (score >= 25) return "AVOID";
  return "SELL";
}

export function calculateConfidence(score: number): number {
  return Number((score / 100).toFixed(2));
}
