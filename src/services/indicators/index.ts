import { calculateEMA, calculateSMA } from './movingAverage';
import { calculateRSI } from './rsi';
import { calculateBollingerBands, BollingerBandsResult } from './bollingerBands';

export * from './movingAverage';
export * from './rsi';
export * from './bollingerBands';

export interface TechnicalIndicatorsSummary {
  rsi14: number;
  emaFast: number; // e.g. EMA 9
  emaSlow: number; // e.g. EMA 21
  sma50: number;
  bollinger: BollingerBandsResult;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
}

/**
 * Agregator utama untuk mendapatkan seluruh indikator dari array harga penutupan
 */
export function analyzeTechnicalIndicators(prices: number[]): TechnicalIndicatorsSummary {
  const rsi14 = calculateRSI(prices, 14);
  const emaFast = calculateEMA(prices, 9);
  const emaSlow = calculateEMA(prices, 21);
  const sma50 = calculateSMA(prices, 50);
  const bollinger = calculateBollingerBands(prices, 20, 2);

  let trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS' = 'SIDEWAYS';
  if (emaFast > emaSlow && rsi14 > 50) {
    trend = 'BULLISH';
  } else if (emaFast < emaSlow && rsi14 < 50) {
    trend = 'BEARISH';
  }

  return {
    rsi14,
    emaFast,
    emaSlow,
    sma50,
    bollinger,
    trend,
  };
}

/**
 * Shared feature vector shape consumed by services/strategy/*
 * (scoring, evaluator, engine) for signal generation.
 */
export interface IndicatorFeatureVector {
    pair?: string;
    price: number;
    volume: number;
    emaFast: number;
    emaSlow: number;
    rsi: number;
    macd: number;
    macdSignal: number;
    macdHistogram: number;
    atr: number;
    adx: number;
    stochasticK: number;
    stochasticD: number;
    bollingerUpper: number;
    bollingerMiddle: number;
    bollingerLower: number;
}
