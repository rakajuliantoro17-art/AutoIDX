/**
 * Menghitung Simple Moving Average (SMA)
 * @param prices Array harga penutupan (close prices)
 * @param period Periode rata-rata (misal: 9, 20, 50)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  const sum = slice.reduce((acc, curr) => acc + curr, 0);
  return sum / period;
}

/**
 * Menghitung Exponential Moving Average (EMA)
 * @param prices Array harga penutupan dari terlama ke terbaru
 * @param period Periode EMA (misal: 9 atau 21)
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;

  const multiplier = 2 / (period + 1);
  // Gunakan SMA sebagai titik awal EMA
  let ema = calculateSMA(prices.slice(0, period), period);

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return Math.round(ema * 100) / 100;
}
