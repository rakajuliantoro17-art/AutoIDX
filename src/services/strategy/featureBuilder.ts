/**
==========================================================
AURA Trade OS
Strategy Feature Builder
Version : 0.1.0 Alpha

Mengubah candle OHLC mentah (services/indodax/candles.ts) jadi
IndicatorFeatureVector (services/indicators) yang dikonsumsi
services/strategy/* (AURA_TREND, EMA_CROSSOVER, MOMENTUM).

Sebelumnya services/strategy/* ini orphan -- sudah lengkap
(rule-based, weighted, position-aware) tapi belum ada yang
menyediakan feature vector lengkapnya (MACD/ATR/ADX/Stochastic/
Bollinger). cron.ts lama cuma hitung RSI+EMA dari close price
saja untuk DecisionEngine lama yang AND-gate kaku.
==========================================================
*/

import {
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateATR,
  calculateADX,
  calculateStochastic,
  calculateBollingerBands,
} from "@/services/indicators";

import type {
  IndicatorFeatureVector,
  OHLC,
} from "@/services/indicators";

import type { Candle } from "@/services/indodax/candles";

const EMA_FAST_PERIOD = 9;
const EMA_SLOW_PERIOD = 21;
const RSI_PERIOD = 14;

/**
 * Jumlah candle minimum supaya SEMUA indikator (terutama MACD,
 * yang butuh slowPeriod(26) + signalPeriod(9) = 35) punya cukup
 * data dan tidak diam-diam balik nilai 0 / netral.
 */
export const MIN_CANDLES_FOR_FEATURES = 40;

export function buildFeatureVector(
  pair: string,
  candles: Candle[]
): IndicatorFeatureVector {

  const closePrices = candles.map((c) => c.close);

  const ohlc: OHLC[] = candles.map((c) => ({
    high: c.high,
    low: c.low,
    close: c.close,
  }));

  const latest = candles[candles.length - 1];

  const emaFast = calculateEMA(closePrices, EMA_FAST_PERIOD);
  const emaSlow = calculateEMA(closePrices, EMA_SLOW_PERIOD);
  const rsi = calculateRSI(closePrices, RSI_PERIOD);

  const macdResult = calculateMACD(closePrices);
  const atrResult = calculateATR(ohlc);
  const adxResult = calculateADX(ohlc);
  const stochasticResult = calculateStochastic(ohlc);
  const bollinger = calculateBollingerBands(closePrices);

  return {
    pair,
    price: latest.close,
    volume: latest.volume,
    emaFast,
    emaSlow,
    rsi,
    macd: macdResult.macd,
    macdSignal: macdResult.signal,
    macdHistogram: macdResult.histogram,
    atr: atrResult.atr,
    adx: adxResult.adx,
    stochasticK: stochasticResult.k,
    stochasticD: stochasticResult.d,
    bollingerUpper: bollinger.upper,
    bollingerMiddle: bollinger.middle,
    bollingerLower: bollinger.lower,
  };

}

export default buildFeatureVector;
