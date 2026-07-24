import { evaluateEmaCrossover } from './emaCrossover';
import { evaluateRsiReversion } from './rsiReversion';
import { MarketConditionInput, StrategySignalResult, StrategyType } from './types';

export class StrategyEngine {
  /**
   * Mengevaluasi kondisi pasar berdasarkan tipe strategi yang dipilih
   */
  evaluate(
    input: MarketConditionInput,
    preferredStrategy: StrategyType = 'HYBRID'
  ): StrategySignalResult {
    const timestamp = new Date().toISOString();

    if (preferredStrategy === 'EMA_CROSSOVER') {
      return evaluateEmaCrossover(input);
    }

    if (preferredStrategy === 'RSI_REVERSION') {
      return evaluateRsiReversion(input);
    }

    // Default: HYBRID Strategy (Kombinasi EMA Crossover + Konfirmasi RSI)
    const emaResult = evaluateEmaCrossover(input);
    const rsiResult = evaluateRsiReversion(input);

    // Konfirmasi BUY Sempurna: EMA Crossover Bullish DAN RSI tidak Overbought (< 60)
    if (emaResult.signal === 'BUY' && input.rsi14 < 60) {
      return {
        strategyName: 'HYBRID',
        signal: 'BUY',
        confidence: 0.9,
        reason: `[HYBRID BUY] ${emaResult.reason} Dikonfirmasi dengan RSI netral/rendah (${input.rsi14}).`,
        timestamp,
      };
    }

    // Konfirmasi BUY dari RSI Oversold Ekstrem (RSI <= 28) meskipun EMA belum cross
    if (rsiResult.signal === 'BUY' && input.rsi14 <= 28) {
      return {
        strategyName: 'HYBRID',
        signal: 'BUY',
        confidence: 0.85,
        reason: `[HYBRID BUY] ${rsiResult.reason}`,
        timestamp,
      };
    }

    // Konfirmasi SELL: Salah satu strategi menghasilkan sinyal SELL
    if (emaResult.signal === 'SELL' || rsiResult.signal === 'SELL') {
      const activeReason = emaResult.signal === 'SELL' ? emaResult.reason : rsiResult.reason;
      return {
        strategyName: 'HYBRID',
        signal: 'SELL',
        confidence: 0.88,
        reason: `[HYBRID SELL] ${activeReason}`,
        timestamp,
      };
    }

    return {
      strategyName: 'HYBRID',
      signal: 'HOLD',
      confidence: 0.5,
      reason: `[${input.pair.toUpperCase()}] Tidak ada konfirmasi sinyal kuat dari kombinasi EMA & RSI.`,
      timestamp,
    };
  }
}

const strategyEngine = new StrategyEngine();
export default strategyEngine;

export * from './types';
export * from './emaCrossover';
export * from './rsiReversion';
