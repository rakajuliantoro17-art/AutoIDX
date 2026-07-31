/**
==========================================================
AURA Trade OS
Average Directional Index (ADX)
Version : 0.0.6 Alpha
==========================================================
*/

import type { OHLC } from "./atr";

export interface ADXResult {
  adx: number;
  plusDI: number;
  minusDI: number;
  trendStrength: "WEAK" | "MODERATE" | "STRONG";
}

const DEFAULT_PERIOD = 14;

/**
 * Hitung ADX menggunakan metode Wilder
 */
export function calculateADX(
  candles: OHLC[],
  period: number = DEFAULT_PERIOD
): ADXResult {

  if (candles.length < period + 1) {
    return {
      adx: 0,
      plusDI: 0,
      minusDI: 0,
      trendStrength: "WEAK",
    };
  }

  const tr: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 1; i < candles.length; i++) {

    const current = candles[i];
    const previous = candles[i - 1];

    const upMove =
      current.high - previous.high;

    const downMove =
      previous.low - current.low;

    plusDM.push(
      upMove > downMove && upMove > 0
        ? upMove
        : 0
    );

    minusDM.push(
      downMove > upMove && downMove > 0
        ? downMove
        : 0
    );

    tr.push(
      Math.max(
        current.high - current.low,
        Math.abs(current.high - previous.close),
        Math.abs(current.low - previous.close)
      )
    );

  }

  let atr =
    tr.slice(0, period)
      .reduce((a, b) => a + b, 0);

  let plus =
    plusDM.slice(0, period)
      .reduce((a, b) => a + b, 0);

  let minus =
    minusDM.slice(0, period)
      .reduce((a, b) => a + b, 0);

  const dxValues: number[] = [];

  for (let i = period; i < tr.length; i++) {

    atr =
      atr -
      atr / period +
      tr[i];

    plus =
      plus -
      plus / period +
      plusDM[i];

    minus =
      minus -
      minus / period +
      minusDM[i];

    const plusDI =
      atr === 0
        ? 0
        : (plus / atr) * 100;

    const minusDI =
      atr === 0
        ? 0
        : (minus / atr) * 100;

    const dx =
      plusDI + minusDI === 0
        ? 0
        : Math.abs(
            plusDI - minusDI
          ) /
            (plusDI + minusDI) *
          100;

    dxValues.push(dx);

  }

  if (!dxValues.length) {

    return {

      adx: 0,

      plusDI: 0,

      minusDI: 0,

      trendStrength: "WEAK",

    };

  }

  let adx =
    dxValues
      .slice(0, period)
      .reduce((a, b) => a + b, 0) /
    Math.min(period, dxValues.length);

  for (
    let i = period;
    i < dxValues.length;
    i++
  ) {

    adx =
      (
        (adx * (period - 1)) +
        dxValues[i]
      ) / period;

  }

  const plusDI =
    atr === 0
      ? 0
      : (plus / atr) * 100;

  const minusDI =
    atr === 0
      ? 0
      : (minus / atr) * 100;

  let trendStrength:
    | "WEAK"
    | "MODERATE"
    | "STRONG";

  if (adx >= 40) {

    trendStrength = "STRONG";

  } else if (adx >= 25) {

    trendStrength = "MODERATE";

  } else {

    trendStrength = "WEAK";

  }

  return {

    adx: Number(adx.toFixed(2)),

    plusDI: Number(
      plusDI.toFixed(2)
    ),

    minusDI: Number(
      minusDI.toFixed(2)
    ),

    trendStrength,

  };

}

export default calculateADX;
