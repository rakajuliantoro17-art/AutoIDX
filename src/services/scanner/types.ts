export interface ScanCriteria {
  minVolumeIdr: number;    // Volume transaksi 24j minimum (misal: Rp 100.000.000)
  maxRsi: number;          // Batas maksimal RSI untuk kriteria oversold (misal: 35)
  requireBullishEma: boolean; // Harus memenuhi syarat EMA Fast > EMA Slow
}

export interface ScannedPairResult {
  pair: string;
  symbol: string;
  lastPrice: number;
  volIdr: number;
  rsi14: number;
  emaFast: number;
  emaSlow: number;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  opportunityScore: number; // Skor potensi 0 - 100
  signalRecommendation: 'STRONG_BUY' | 'BUY' | 'NEUTRAL';
}

export interface MarketScanSummary {
  scannedCount: number;
  qualifiedCount: number;
  topOpportunities: ScannedPairResult[];
  scannedAt: string;
}
