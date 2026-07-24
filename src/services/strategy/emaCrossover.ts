import { MarketConditionInput, StrategySignalResult } from './types';

/**
 * Logika Strategi EMA Crossover
 * - BUY  : Fast EMA menembus ke atas Slow EMA (Golden Cross) saat sedang tidak memegang posisi.
 * - SELL : Fast EMA menembus ke bawah Slow EMA (Death Cross) saat sedang memegang koin.
 */
export function evaluateEmaCrossover(input: MarketConditionInput): StrategySignalResult {
  const { pair, currentPrice, emaFast, emaSlow, inPosition } = input;
  const timestamp = new Date().toISOString();

  // Condition 1: Fast EMA > Slow EMA (Bullish Trend)
  if (emaFast > emaSlow) {
    if (!inPosition) {
      return {
        strategyName: 'EMA_CROSSOVER',
        signal: 'BUY',
        confidence: 0.8,
        reason: `[${pair.toUpperCase()}] Golden Cross terdeteksi! EMA Fast (${emaFast}) berada di atas EMA Slow (${emaSlow}).`,
        timestamp,
      };
    }
  }

  // Condition 2: Fast EMA < Slow EMA (Bearish Trend)
  if (emaFast < emaSlow) {
    if (inPosition) {
      return {
        strategyName: 'EMA_CROSSOVER',
        signal: 'SELL',
        confidence: 0.85,
        reason: `[${pair.toUpperCase()}] Death Cross terdeteksi! EMA Fast (${emaFast}) memotong di bawah EMA Slow (${emaSlow}).`,
        timestamp,
      };
    }
  }

  return {
    strategyName: 'EMA_CROSSOVER',
    signal: 'HOLD',
    confidence: 0.5,
    reason: `[${pair.toUpperCase()}] Tren EMA masih konsisten/sideways. Belum ada sinyal crossover baru.`,
    timestamp,
  };
}
