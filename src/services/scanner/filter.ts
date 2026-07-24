import { ScannedPairResult } from './types';

/**
 * Menghitung Opportunity Score (0 - 100) berdasarkan kombinasi RSI & EMA Trend
 */
export function calculateOpportunityScore(
  rsi: number,
  emaFast: number,
  emaSlow: number,
  volIdr: number
): number {
  let score = 50;

  // 1. Bobot RSI (Makin oversold makin tinggi skornya)
  if (rsi <= 25) score += 30;
  else if (rsi <= 35) score += 20;
  else if (rsi >= 70) score -= 30;

  // 2. Bobot EMA Trend Crossover
  if (emaFast > emaSlow) score += 15;
  else score -= 15;

  // 3. Likuiditas Volume (Bonus untuk volume di atas 1 Miliar IDR)
  if (volIdr >= 1_000_000_000) score += 5;

  // Batasi rentang skor 0 - 100
  return Math.min(100, Math.max(0, score));
}

/**
 * Memetakan skor menjadi rekomendasi sinyal aksi
 */
export function deriveSignalRecommendation(score: number): ScannedPairResult['signalRecommendation'] {
  if (score >= 85) return 'STRONG_BUY';
  if (score >= 65) return 'BUY';
  return 'NEUTRAL';
}
