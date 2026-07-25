/**
==========================================================
AURA Trade OS
Average True Range (ATR)
Version : 0.0.6 Alpha
==========================================================
*/

export interface OHLC {
  high: number;
  low: number;
  close: number;
}

export interface ATRResult {
  atr: number;
  volatility: "LOW" | "MEDIUM" | "HIGH";
}

const DEFAULT_PERIOD = 14;

/**
 * Menghitung Average True Range (ATR)
 */
export function calculateATR(
  candles: OHLC[],
  period: number = DEFAULT_PERIOD
): ATRResult {

  if (candles.length < period + 1) {

    return {

      atr: 0,

      volatility: "LOW",

    };

  }

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {

    const current = candles[i];
    const previous = candles[i - 1];

    const tr = Math.max(

      current.high - current.low,

      Math.abs(current.high - previous.close),

      Math.abs(current.low - previous.close)

    );

    trueRanges.push(tr);

  }

  let atr =

    trueRanges
      .slice(0, period)
      .reduce((sum, value) => sum + value, 0) / period;

  for (

    let i = period;

    i < trueRanges.length;

    i++

  ) {

    atr =

      (

        atr * (period - 1) +

        trueRanges[i]

      ) / period;

  }

  const latestClose =

    candles[candles.length - 1].close;

  const atrPercent =

    latestClose > 0

      ? (atr / latestClose) * 100

      : 0;

  let volatility:

    | "LOW"

    | "MEDIUM"

    | "HIGH";

  if (atrPercent >= 5) {

    volatility = "HIGH";

  } else if (atrPercent >= 2) {

    volatility = "MEDIUM";

  } else {

    volatility = "LOW";

  }

  return {

    atr: Number(atr.toFixed(2)),

    volatility,

  };

}

/**
 * Menghitung Stop Loss berbasis ATR
 */
export function calculateATRStopLoss(
  entryPrice: number,
  atr: number,
  multiplier: number = 2
): number {

  return Number(

    (entryPrice - atr * multiplier).toFixed(2)

  );

}

/**
 * Menghitung Take Profit berbasis ATR
 */
export function calculateATRTakeProfit(
  entryPrice: number,
  atr: number,
  multiplier: number = 3
): number {

  return Number(

    (entryPrice + atr * multiplier).toFixed(2)

  );

}

/**
 * Menghitung Risk Reward Ratio
 */
export function calculateRiskReward(

  entryPrice: number,

  stopLoss: number,

  takeProfit: number

): number {

  const risk =

    entryPrice - stopLoss;

  const reward =

    takeProfit - entryPrice;

  if (risk <= 0) {

    return 0;

  }

  return Number(

    (reward / risk).toFixed(2)

  );

}

export default calculateATR;
