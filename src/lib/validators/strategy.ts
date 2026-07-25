/**
==========================================================
AURA Trade OS
Strategy Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";
import NumberValidator from "./number";

export interface StrategyConfiguration {
  emaFast: number;
  emaSlow: number;

  rsiPeriod: number;
  rsiOversold: number;
  rsiOverbought: number;

  timeframe: string;
}

const VALID_TIMEFRAMES = [
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
] as const;

export class StrategyValidator {

  /**
   * Validasi konfigurasi strategi
   */
  static validate(
    config: StrategyConfiguration
  ): StrategyConfiguration {

    this.validateEMA(
      config.emaFast,
      config.emaSlow
    );

    this.validateRSI(
      config.rsiPeriod,
      config.rsiOversold,
      config.rsiOverbought
    );

    this.validateTimeframe(
      config.timeframe
    );

    return config;

  }

  /**
   * EMA
   */
  static validateEMA(
    fast: number,
    slow: number
  ): void {

    NumberValidator.integer(
      fast,
      "EMA Fast"
    );

    NumberValidator.integer(
      slow,
      "EMA Slow"
    );

    if (fast <= 0 || slow <= 0) {
      throw AppError.validation(
        "EMA period must be greater than zero."
      );
    }

    if (fast >= slow) {
      throw AppError.validation(
        "EMA Fast must be smaller than EMA Slow."
      );
    }

  }

  /**
   * RSI
   */
  static validateRSI(
    period: number,
    oversold: number,
    overbought: number
  ): void {

    NumberValidator.integer(
      period,
      "RSI Period"
    );

    NumberValidator.rsi(
      oversold
    );

    NumberValidator.rsi(
      overbought
    );

    if (period < 2) {
      throw AppError.validation(
        "RSI period must be at least 2."
      );
    }

    if (oversold >= overbought) {
      throw AppError.validation(
        "RSI Oversold must be lower than RSI Overbought."
      );
    }

  }

  /**
   * Timeframe
   */
  static validateTimeframe(
    timeframe: string
  ): string {

    if (
      !VALID_TIMEFRAMES.includes(
        timeframe as (typeof VALID_TIMEFRAMES)[number]
      )
    ) {
      throw AppError.validation(
        `Unsupported timeframe: ${timeframe}`
      );
    }

    return timeframe;

  }

  /**
   * Bullish EMA Cross
   */
  static isBullishCross(
    emaFast: number,
    emaSlow: number
  ): boolean {

    NumberValidator.price(
      emaFast
    );

    NumberValidator.price(
      emaSlow
    );

    return emaFast > emaSlow;

  }

  /**
   * Bearish EMA Cross
   */
  static isBearishCross(
    emaFast: number,
    emaSlow: number
  ): boolean {

    NumberValidator.price(
      emaFast
    );

    NumberValidator.price(
      emaSlow
    );

    return emaFast < emaSlow;

  }

  /**
   * RSI Oversold
   */
  static isOversold(
    rsi: number,
    oversold = 30
  ): boolean {

    NumberValidator.rsi(
      rsi
    );

    return rsi <= oversold;

  }

  /**
   * RSI Overbought
   */
  static isOverbought(
    rsi: number,
    overbought = 70
  ): boolean {

    NumberValidator.rsi(
      rsi
    );

    return rsi >= overbought;

  }

  /**
   * Sinyal BUY dasar
   */
  static shouldBuy(
    emaFast: number,
    emaSlow: number,
    rsi: number,
    oversold = 30
  ): boolean {

    return (
      this.isBullishCross(
        emaFast,
        emaSlow
      ) &&
      this.isOversold(
        rsi,
        oversold
      )
    );

  }

  /**
   * Sinyal SELL dasar
   */
  static shouldSell(
    emaFast: number,
    emaSlow: number,
    rsi: number,
    overbought = 70
  ): boolean {

    return (
      this.isBearishCross(
        emaFast,
        emaSlow
      ) &&
      this.isOverbought(
        rsi,
        overbought
      )
    );

  }

}

export default StrategyValidator;
