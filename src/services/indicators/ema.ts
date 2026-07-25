/**
==========================================================
AURA Trade OS
Exponential Moving Average (EMA)
Version : 0.0.6 Alpha
==========================================================
*/

export interface EMAResult {
  period: number;
  value: number;
}

export interface EMACrossoverResult {
  emaFast: number;
  emaSlow: number;
  trend: "BULLISH" | "BEARISH" | "SIDEWAYS";
  crossover: "GOLDEN_CROSS" | "DEATH_CROSS" | "NONE";
}

const DEFAULT_FAST = 9;
const DEFAULT_SLOW = 21;

/**
 * Menghitung EMA
 */
export function calculateEMA(
  prices: number[],
  period: number
): number {

  if (prices.length < period) {
    return 0;
  }

  // SMA awal
  const sma =
    prices
      .slice(0, period)
      .reduce((sum, value) => sum + value, 0) /
    period;

  const multiplier =
    2 / (period + 1);

  let ema = sma;

  for (
    let i = period;
    i < prices.length;
    i++
  ) {

    ema =
      (prices[i] - ema) *
        multiplier +
      ema;

  }

  return Number(
    ema.toFixed(2)
  );

}

/**
 * Menghasilkan objek EMA
 */
export function getEMA(
  prices: number[],
  period: number
): EMAResult {

  return {

    period,

    value: calculateEMA(
      prices,
      period
    ),

  };

}

/**
 * Analisis EMA Fast vs EMA Slow
 */
export function analyzeEMA(
  prices: number[],
  fastPeriod: number = DEFAULT_FAST,
  slowPeriod: number = DEFAULT_SLOW
): EMACrossoverResult {

  const emaFast =
    calculateEMA(
      prices,
      fastPeriod
    );

  const emaSlow =
    calculateEMA(
      prices,
      slowPeriod
    );

  const tolerance =
    emaSlow * 0.001;

  let trend:
    | "BULLISH"
    | "BEARISH"
    | "SIDEWAYS";

  let crossover:
    | "GOLDEN_CROSS"
    | "DEATH_CROSS"
    | "NONE";

  if (
    emaFast >
    emaSlow + tolerance
  ) {

    trend = "BULLISH";
    crossover = "GOLDEN_CROSS";

  } else if (
    emaFast <
    emaSlow - tolerance
  ) {

    trend = "BEARISH";
    crossover = "DEATH_CROSS";

  } else {

    trend = "SIDEWAYS";
    crossover = "NONE";

  }

  return {

    emaFast,

    emaSlow,

    trend,

    crossover,

  };

}

/**
 * Golden Cross
 */
export function isGoldenCross(
  emaFast: number,
  emaSlow: number
): boolean {

  return emaFast > emaSlow;

}

/**
 * Death Cross
 */
export function isDeathCross(
  emaFast: number,
  emaSlow: number
): boolean {

  return emaFast < emaSlow;

}

/**
 * Menentukan arah trend
 */
export function determineTrend(
  emaFast: number,
  emaSlow: number
): "BULLISH" | "BEARISH" | "SIDEWAYS" {

  const tolerance =
    emaSlow * 0.001;

  if (
    emaFast >
    emaSlow + tolerance
  ) {

    return "BULLISH";

  }

  if (
    emaFast <
    emaSlow - tolerance
  ) {

    return "BEARISH";

  }

  return "SIDEWAYS";

}

export default calculateEMA;
