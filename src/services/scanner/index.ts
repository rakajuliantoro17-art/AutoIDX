import indodaxTickerService from '../indodax/ticker.js';
import indodaxMarketService from '../indodax/market.js';
import { analyzeTechnicalIndicators } from '../indicators';
import { ScanCriteria, ScannedPairResult, MarketScanSummary } from './types';
import { calculateOpportunityScore, deriveSignalRecommendation } from './filter';

export class MarketScanner {
  private defaultPairs = ['btc_idr', 'eth_idr', 'sol_idr', 'sgb_idr', 'ada_idr', 'xrpl_idr'];

  /**
   * Pindai daftar pair pasar untuk mencari peluang entry terbaik
   */
  async scanMarket(
    pairsToScan: string[] = this.defaultPairs,
    criteria: Partial<ScanCriteria> = {}
  ): Promise<MarketScanSummary> {
    const minVolume = criteria.minVolumeIdr ?? 50_000_000; // Default Rp 50 Juta
    const maxRsiThreshold = criteria.maxRsi ?? 40;

    const qualifiedResults: ScannedPairResult[] = [];

    // Proses pemindaian secara paralel
    const scanPromises = pairsToScan.map(async (pair) => {
      try {
        // 1. Ambil summary ticker & volume
        const ticker = await indodaxTickerService.getFormattedTicker(pair);
        if (!ticker || ticker.volIdr < minVolume) return null;

        // 2. Ambil deret harga histori terkini untuk kalkulasi indikator
        const priceSeries = await indodaxMarketService.getPriceSeries(pair, 30);
        if (priceSeries.length < 15) return null;

        // 3. Analisis indikator teknikal
        const tech = analyzeTechnicalIndicators(priceSeries);

        // 4. Hitung Opportunity Score
        const score = calculateOpportunityScore(
          tech.rsi14,
          tech.emaFast,
          tech.emaSlow,
          ticker.volIdr
        );

        // 5. Filter kriteria RSI
        if (tech.rsi14 <= maxRsiThreshold || score >= 65) {
          const result: ScannedPairResult = {
            pair: pair.toLowerCase(),
            symbol: ticker.symbol,
            lastPrice: ticker.lastPrice,
            volIdr: ticker.volIdr,
            rsi14: tech.rsi14,
            emaFast: tech.emaFast,
            emaSlow: tech.emaSlow,
            trend: tech.trend,
            opportunityScore: score,
            signalRecommendation: deriveSignalRecommendation(score),
          };
          return result;
        }

        return null;
      } catch (err) {
        console.error(`[MarketScanner Error] Failed scanning ${pair}:`, err);
        return null;
      }
    });

    const rawResults = await Promise.all(scanPromises);

    // Filter null values & urutkan berdasarkan Opportunity Score tertinggi
    rawResults.forEach((res) => {
      if (res) qualifiedResults.push(res);
    });

    qualifiedResults.sort((a, b) => b.opportunityScore - a.opportunityScore);

    return {
      scannedCount: pairsToScan.length,
      qualifiedCount: qualifiedResults.length,
      topOpportunities: qualifiedResults,
      scannedAt: new Date().toISOString(),
    };
  }
}

const marketScanner = new MarketScanner();
export default marketScanner;
export * from './types';
export * from './filter';
