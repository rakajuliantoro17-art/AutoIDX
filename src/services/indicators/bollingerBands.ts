import { calculateSMA } from './movingAverage';

export interface BollingerBandsResult {
  middle: number;
  upper: number;
  lower: number;
}

/**
 * Menghitung Bollinger Bands
 * @param prices Array harga penutupan
 * @param period Periode rata-rata (default: 20)
 * @param stdDev Multiplier Standar Deviasi (default: 2)
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): BollingerBandsResult {
  if (prices.length < period) {
    const lastPrice = prices[prices.length - 1] || 0;
    return { middle: lastPrice, upper: lastPrice, lower: lastPrice };
  }

  const slice = prices.slice(-period);
  const middle = calculateSMA(slice, period);

  // Hitung Standar Deviasi
  const mean = middle;
  const variance = slice.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
  const sd = Math.sqrt(variance);

  return {
    middle: Math.round(middle * 100) / 100,
    upper: Math.round((middle + sd * stdDev) * 100) / 100,
    lower: Math.round((middle - sd * stdDev) * 100) / 100,
  };
}

export default calculateBollingerBands;
