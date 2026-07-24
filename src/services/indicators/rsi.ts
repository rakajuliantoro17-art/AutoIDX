/**
 * Menghitung Relative Strength Index (RSI)
 * @param prices Array harga penutupan (minimal 15 data untuk RSI-14)
 * @param period Periode RSI (default: 14)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length <= period) return 50; // Default netral jika data tidak cukup

  let gains = 0;
  let losses = 0;

  // Hitung Gain dan Loss awal
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smooth penghitungan menggunakan metode Wilder
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100;
}
