import { MarketConditionInput, StrategySignalResult } from './types';

/**
 * Logika Strategi RSI Mean Reversion
 * - BUY  : RSI <= 30 (Oversold - Koin murah/jenuh jual).
 * - SELL : RSI >= 70 (Overbought - Koin mahal/jenuh beli).
 */
export function evaluateRsiReversion(
  input: MarketConditionInput,
  oversoldThreshold: number = 30,
  overboughtThreshold: number = 70
): StrategySignalResult {
  const { pair, rsi14, inPosition } = input;
  const timestamp = new Date().toISOString();

  // Buy Signal: Jenuh Jual (Oversold)
  if (rsi14 <= oversoldThreshold && !inPosition) {
    return {
      strategyName: 'RSI_REVERSION',
      signal: 'BUY',
      confidence: 0.85,
      reason: `[${pair.toUpperCase()}] RSI(14) menyentuh level Oversold (${rsi14} <= ${oversoldThreshold}). Potensi pembalikan arah naik.`,
      timestamp,
    };
  }

  // Sell Signal: Jenuh Beli (Overbought)
  if (rsi14 >= overboughtThreshold && inPosition) {
    return {
      strategyName: 'RSI_REVERSION',
      signal: 'SELL',
      confidence: 0.85,
      reason: `[${pair.toUpperCase()}] RSI(14) menyentuh level Overbought (${rsi14} >= ${overboughtThreshold}). Saatnya mengamankan keuntungan.`,
      timestamp,
    };
  }

  return {
    strategyName: 'RSI_REVERSION',
    signal: 'HOLD',
    confidence: 0.5,
    reason: `[${pair.toUpperCase()}] RSI(14) berada di area netral (${rsi14}).`,
    timestamp,
  };
}
