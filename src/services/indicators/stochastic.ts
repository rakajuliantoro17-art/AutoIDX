/**
==========================================================
AURA Trade OS
Stochastic Oscillator
Version : 0.0.6 Alpha
==========================================================
*/

import type { OHLC } from "./atr";

export interface StochasticResult {

  k: number;

  d: number;

  signal:
    | "BUY"
    | "SELL"
    | "HOLD";

  condition:
    | "OVERSOLD"
    | "OVERBOUGHT"
    | "NEUTRAL";

}

const DEFAULT_K_PERIOD = 14;
const DEFAULT_D_PERIOD = 3;

/**
 * Menghitung Stochastic Oscillator
 */
export function calculateStochastic(

  candles: OHLC[],

  kPeriod: number = DEFAULT_K_PERIOD,

  dPeriod: number = DEFAULT_D_PERIOD

): StochasticResult {

  if (candles.length < kPeriod + dPeriod) {

    return {

      k: 0,

      d: 0,

      signal: "HOLD",

      condition: "NEUTRAL",

    };

  }

  const kSeries: number[] = [];

  for (

    let i = kPeriod - 1;

    i < candles.length;

    i++

  ) {

    const window = candles.slice(

      i - kPeriod + 1,

      i + 1

    );

    const highestHigh = Math.max(

      ...window.map(c => c.high)

    );

    const lowestLow = Math.min(

      ...window.map(c => c.low)

    );

    const close = candles[i].close;

    const k =

      highestHigh === lowestLow

        ? 0

        : ((close - lowestLow) /

            (highestHigh - lowestLow)) *

          100;

    kSeries.push(k);

  }

  const latestK =

    kSeries[kSeries.length - 1];

  const latestD =

    kSeries
      .slice(-dPeriod)
      .reduce((a, b) => a + b, 0) /
    dPeriod;

  let condition:

    | "OVERSOLD"

    | "OVERBOUGHT"

    | "NEUTRAL";

  if (latestK <= 20) {

    condition = "OVERSOLD";

  } else if (latestK >= 80) {

    condition = "OVERBOUGHT";

  } else {

    condition = "NEUTRAL";

  }

  let signal:
    | "BUY"
    | "SELL"
    | "HOLD";

  if (

    latestK > latestD &&
    latestK < 80

  ) {

    signal = "BUY";

  } else if (

    latestK < latestD &&
    latestK > 20

  ) {

    signal = "SELL";

  } else {

    signal = "HOLD";

  }

  return {

    k: Number(
      latestK.toFixed(2)
    ),

    d: Number(
      latestD.toFixed(2)
    ),

    signal,

    condition,

  };

}

/**
 * Oversold
 */
export function isOversold(
  k: number
): boolean {

  return k <= 20;

}

/**
 * Overbought
 */
export function isOverbought(
  k: number
): boolean {

  return k >= 80;

}

/**
 * Bullish Cross
 */
export function isBullishCross(

  k: number,

  d: number

): boolean {

  return k > d;

}

/**
 * Bearish Cross
 */
export function isBearishCross(

  k: number,

  d: number

): boolean {

  return k < d;

}

export default calculateStochastic;
