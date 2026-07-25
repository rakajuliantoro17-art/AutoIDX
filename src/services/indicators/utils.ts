/**
==========================================================
AURA Trade OS
Indicator Utilities
Version : 0.0.6 Alpha
==========================================================
*/

/**
 * Menghitung rata-rata (Mean)
 */
export function mean(values: number[]): number {
  if (!values.length) return 0;

  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Menghitung penjumlahan
 */
export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

/**
 * Menghitung nilai maksimum
 */
export function max(values: number[]): number {
  return Math.max(...values);
}

/**
 * Menghitung nilai minimum
 */
export function min(values: number[]): number {
  return Math.min(...values);
}

/**
 * Standard Deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const avg = mean(values);

  const variance =
    values.reduce(
      (total, value) =>
        total + Math.pow(value - avg, 2),
      0
    ) / values.length;

  return Math.sqrt(variance);
}

/**
 * Simple Moving Average
 */
export function sma(
  values: number[],
  period: number
): number {

  if (values.length < period) {
    return 0;
  }

  const slice = values.slice(-period);

  return mean(slice);
}

/**
 * Exponential Moving Average
 */
export function ema(
  values: number[],
  period: number
): number {

  if (values.length < period) {
    return 0;
  }

  const multiplier = 2 / (period + 1);

  let emaValue = sma(
    values.slice(0, period),
    period
  );

  for (
    let i = period;
    i < values.length;
    i++
  ) {

    emaValue =
      (values[i] - emaValue) *
        multiplier +
      emaValue;

  }

  return emaValue;
}

/**
 * Persentase perubahan
 */
export function percentageChange(
  previous: number,
  current: number
): number {

  if (previous === 0) {
    return 0;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
}

/**
 * Clamp angka
 */
export function clamp(
  value: number,
  minValue: number,
  maxValue: number
): number {

  return Math.min(
    maxValue,
    Math.max(minValue, value)
  );

}

/**
 * Membulatkan angka
 */
export function round(
  value: number,
  decimals: number = 2
): number {

  return Number(
    value.toFixed(decimals)
  );

}

/**
 * Mengambil nilai tertinggi
 * dari n candle terakhir
 */
export function highest(
  values: number[],
  period: number
): number {

  if (values.length < period) {
    return 0;
  }

  return Math.max(
    ...values.slice(-period)
  );

}

/**
 * Mengambil nilai terendah
 * dari n candle terakhir
 */
export function lowest(
  values: number[],
  period: number
): number {

  if (values.length < period) {
    return 0;
  }

  return Math.min(
    ...values.slice(-period)
  );

}

/**
 * Validasi data harga
 */
export function isValidSeries(
  values: number[]
): boolean {

  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every(
      (v) =>
        Number.isFinite(v) &&
        v >= 0
    )
  );

}

/**
 * Mengambil harga penutupan terakhir
 */
export function latest(
  values: number[]
): number {

  if (!values.length) {
    return 0;
  }

  return values[values.length - 1];

}
