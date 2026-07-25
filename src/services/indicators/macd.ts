/**
==========================================================
AURA Trade OS
Moving Average Convergence Divergence (MACD)
Version : 0.0.6 Alpha
==========================================================
*/

import { calculateEMA } from "./ema";

const FAST_PERIOD = 12;
const SLOW_PERIOD = 26;
const SIGNAL_PERIOD = 9;

export interface MACDResult {

  macd: number;

  signal: number;

  histogram: number;

  trend: "BULLISH" | "BEARISH" | "NEUTRAL";

  crossover:
    | "BULLISH_CROSS"
    | "BEARISH_CROSS"
    | "NONE";

}

/**
 * Menghitung MACD
 */
export function calculateMACD(

  prices: number[],

  fastPeriod: number = FAST_PERIOD,

  slowPeriod: number = SLOW_PERIOD,

  signalPeriod: number = SIGNAL_PERIOD

): MACDResult {

  if (prices.length < slowPeriod + signalPeriod) {

    return {

      macd: 0,

      signal: 0,

      histogram: 0,

      trend: "NEUTRAL",

      crossover: "NONE",

    };

  }

  const macdSeries: number[] = [];

  for (

    let i = slowPeriod;

    i <= prices.length;

    i++

  ) {

    const slice = prices.slice(0, i);

    const emaFast =
      calculateEMA(
        slice,
        fastPeriod
      );

    const emaSlow =
      calculateEMA(
        slice,
        slowPeriod
      );

    macdSeries.push(
      emaFast - emaSlow
    );

  }

  const signal =
    calculateEMA(
      macdSeries,
      signalPeriod
    );

  const macd =
    macdSeries[
      macdSeries.length - 1
    ];

  const histogram =
    macd - signal;

  let trend:
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL";

  let crossover:
    | "BULLISH_CROSS"
    | "BEARISH_CROSS"
    | "NONE";

  const tolerance = 0.000001;

  if (
    histogram > tolerance
  ) {

    trend = "BULLISH";
    crossover = "BULLISH_CROSS";

  } else if (
    histogram < -tolerance
  ) {

    trend = "BEARISH";
    crossover = "BEARISH_CROSS";

  } else {

    trend = "NEUTRAL";
    crossover = "NONE";

  }

  return {

    macd: Number(
      macd.toFixed(6)
    ),

    signal: Number(
      signal.toFixed(6)
    ),

    histogram: Number(
      histogram.toFixed(6)
    ),

    trend,

    crossover,

  };

}

/**
 * Bullish MACD Cross
 */
export function isBullishMACD(

  macd: number,

  signal: number

): boolean {

  return macd > signal;

}

/**
 * Bearish MACD Cross
 */
export function isBearishMACD(

  macd: number,

  signal: number

): boolean {

  return macd < signal;

}

/**
 * Momentum berdasarkan histogram
 */
export function getMomentum(

  histogram: number

): "POSITIVE" | "NEGATIVE" | "FLAT" {

  const tolerance = 0.000001;

  if (histogram > tolerance) {

    return "POSITIVE";

  }

  if (histogram < -tolerance) {

    return "NEGATIVE";

  }

  return "FLAT";

}

export default calculateMACD;
