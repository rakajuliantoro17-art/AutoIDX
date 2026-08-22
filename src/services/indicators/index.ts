import { calculateEMA, calculateSMA } from './movingAverage';
import { calculateRSI } from './rsi';
import { calculateBollingerBands, BollingerBandsResult } from './bollingerBands';

export * from './movingAverage';
export * from './rsi';
export * from './bollingerBands';

/* MACD */
export { calculateMACD } from './macd';
export type { MACDResult } from './macd';

/* ATR — sumber tunggal untuk interface OHLC */
export { calculateATR } from './atr';
export type { ATRResult, OHLC } from './atr';

/* ADX (OHLC dipakai dari atr.ts, tidak diekspor ulang di sini) */
export { calculateADX } from './adx';
export type { ADXResult } from './adx';

/* Stochastic (OHLC dipakai dari atr.ts, tidak diekspor ulang di sini) */
export { calculateStochastic } from './stochastic';
export type { StochasticResult } from './stochastic';

/**
 * Agregator utama untuk mendapatkan seluruh indikator dari array harga penutupan
 */
export interface TechnicalIndicatorsSummary {
  rsi14: number;
  emaFast: number;
  emaSlow: number;
  sma50: number;
  bollinger: BollingerBandsResult;
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
}

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
    /**
     * Opsional -- ADX standar (Wilder) menghasilkan +DI/-DI sebagai
     * bagian dari perhitungan yang sama, tapi field ini sebelumnya
     * dibuang (cuma "adx" scalar yang disimpan) walau calculateADX()
     * di scheduler/cron.ts sudah menghitungnya. Ditambahkan sebagai
     * optional (bukan required) supaya non-breaking untuk seluruh
     * consumer type ini yang sudah ada -- konsumen lama yang tidak
     * mengisi field ini tetap valid secara TypeScript.
     * Dipakai services/intelligence/ml/mlAdvisor.ts supaya fitur yang
     * dikirim ke model ML persis sama dengan fitur yang dipakai saat
     * training (lihat services/ml/dataset/collector.ts).
     */
    plusDI?: number;
    minusDI?: number;
    stochasticK: number;
    stochasticD: number;
    bollingerUpper: number;
    bollingerMiddle: number;
    bollingerLower: number;
}
