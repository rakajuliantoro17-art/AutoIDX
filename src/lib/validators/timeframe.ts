/**
==========================================================
AURA Trade OS
Timeframe Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";

export const SUPPORTED_TIMEFRAMES = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "6h",
  "12h",
  "1d",
  "3d",
  "1w",
] as const;

export type SupportedTimeframe =
  typeof SUPPORTED_TIMEFRAMES[number];

export class TimeframeValidator {

  /**
   * Validasi timeframe
   */
  static validate(
    timeframe: string
  ): SupportedTimeframe {

    const normalized =
      this.normalize(timeframe);

    if (!this.isSupported(normalized)) {
      throw AppError.validation(
        `Unsupported timeframe: ${timeframe}`
      );
    }

    return normalized;

  }

  /**
   * Normalisasi input
   */
  static normalize(
    timeframe: string
  ): SupportedTimeframe {

    return timeframe
      .trim()
      .toLowerCase() as SupportedTimeframe;

  }

  /**
   * Cek apakah timeframe didukung
   */
  static isSupported(
    timeframe: string
  ): timeframe is SupportedTimeframe {

    return SUPPORTED_TIMEFRAMES.includes(
      timeframe as SupportedTimeframe
    );

  }

  /**
   * Mengembalikan semua timeframe
   */
  static getAll(): SupportedTimeframe[] {

    return [...SUPPORTED_TIMEFRAMES];

  }

  /**
   * Konversi timeframe ke menit
   */
  static toMinutes(
    timeframe: SupportedTimeframe
  ): number {

    const map: Record<
      SupportedTimeframe,
      number
    > = {

      "1m": 1,
      "3m": 3,
      "5m": 5,
      "15m": 15,
      "30m": 30,

      "1h": 60,
      "2h": 120,
      "4h": 240,
      "6h": 360,
      "12h": 720,

      "1d": 1440,
      "3d": 4320,

      "1w": 10080,

    };

    return map[timeframe];

  }

  /**
   * Konversi menit menjadi timeframe
   */
  static fromMinutes(
    minutes: number
  ): SupportedTimeframe {

    const found =
      Object.entries({
        "1m": 1,
        "3m": 3,
        "5m": 5,
        "15m": 15,
        "30m": 30,
        "1h": 60,
        "2h": 120,
        "4h": 240,
        "6h": 360,
        "12h": 720,
        "1d": 1440,
        "3d": 4320,
        "1w": 10080,
      }).find(
        ([, value]) => value === minutes
      );

    if (!found) {
      throw AppError.validation(
        `Unsupported timeframe duration: ${minutes} minutes`
      );
    }

    return found[0] as SupportedTimeframe;

  }

  /**
   * Timeframe intraday
   */
  static isIntraday(
    timeframe: SupportedTimeframe
  ): boolean {

    return this.toMinutes(timeframe) < 1440;

  }

  /**
   * Timeframe harian atau lebih tinggi
   */
  static isHigherTimeframe(
    timeframe: SupportedTimeframe
  ): boolean {

    return this.toMinutes(timeframe) >= 1440;

  }

}

export default TimeframeValidator;
