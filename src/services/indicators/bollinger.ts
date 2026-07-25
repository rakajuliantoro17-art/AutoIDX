/**
==========================================================
AURA Trade OS
Bollinger Bands Indicator
Version : 0.0.6 Alpha
==========================================================
*/

const DEFAULT_PERIOD = 20;
const DEFAULT_STD_DEV = 2;

export interface BollingerResult {
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
  signal: "OVERBOUGHT" | "OVERSOLD" | "NEUTRAL";
}

/**
 * Menghitung Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = DEFAULT_PERIOD,
  stdDevMultiplier: number = DEFAULT_STD_DEV
): BollingerResult {

  if (prices.length < period) {

    return {

      upper: 0,

      middle: 0,

      lower: 0,

      bandwidth: 0,

      signal: "NEUTRAL",

    };

  }

  const slice = prices.slice(-period);

  const sma =
    slice.reduce(
      (sum, value) => sum + value,
      0
    ) / period;

  const variance =
    slice.reduce(
      (sum, value) => {

        return (
          sum +
          Math.pow(value - sma, 2)
        );

      },
      0
    ) / period;

  const stdDev =
    Math.sqrt(variance);

  const upper =
    sma +
    stdDevMultiplier * stdDev;

  const lower =
    sma -
    stdDevMultiplier * stdDev;

  const latest =
    prices[prices.length - 1];

  const bandwidth =
    sma === 0
      ? 0
      : ((upper - lower) / sma) * 100;

  let signal:
    | "OVERBOUGHT"
    | "OVERSOLD"
    | "NEUTRAL";

  if (latest >= upper) {

    signal = "OVERBOUGHT";

  } else if (latest <= lower) {

    signal = "OVERSOLD";

  } else {

    signal = "NEUTRAL";

  }

  return {

    upper: Number(
      upper.toFixed(2)
    ),

    middle: Number(
      sma.toFixed(2)
    ),

    lower: Number(
      lower.toFixed(2)
    ),

    bandwidth: Number(
      bandwidth.toFixed(2)
    ),

    signal,

  };

}

/**
 * Menghitung Standard Deviation
 */
export function calculateStandardDeviation(
  values: number[]
): number {

  if (!values.length) {

    return 0;

  }

  const mean =
    values.reduce(
      (a, b) => a + b,
      0
    ) / values.length;

  const variance =
    values.reduce(
      (sum, value) => {

        return (
          sum +
          Math.pow(value - mean, 2)
        );

      },
      0
    ) / values.length;

  return Number(
    Math.sqrt(variance).toFixed(6)
  );

}

/**
 * Menghitung SMA
 */
export function calculateSMA(
  values: number[]
): number {

  if (!values.length) {

    return 0;

  }

  return Number(
    (
      values.reduce(
        (a, b) => a + b,
        0
      ) / values.length
    ).toFixed(2)
  );

}

/**
 * Mengidentifikasi kondisi squeeze
 * (volatilitas rendah)
 */
export function isBollingerSqueeze(
  bandwidth: number,
  threshold: number = 5
): boolean {

  return bandwidth <= threshold;

}

/**
 * Mengidentifikasi breakout
 */
export function detectBreakout(
  price: number,
  upper: number,
  lower: number
): "UP" | "DOWN" | "NONE" {

  if (price > upper) {

    return "UP";

  }

  if (price < lower) {

    return "DOWN";

  }

  return "NONE";

}

export default calculateBollingerBands;
