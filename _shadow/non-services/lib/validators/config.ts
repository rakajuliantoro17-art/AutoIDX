/**
==========================================================
AURA Trade OS
Configuration Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";

export interface BotConfiguration {
  pair: string;
  mode: string;
  interval: number;
  defaultTradeAmount: number;
  maxTradeAmount: number;
  targetProfit: number;
  stopLoss: number;
  maxOpenPosition?: number;
}

const VALID_MODES = [
  "paper",
  "live",
] as const;

export class ConfigValidator {

  /**
   * Validasi konfigurasi bot secara keseluruhan
   */
  static validate(config: BotConfiguration): void {

    this.validatePair(config.pair);
    this.validateMode(config.mode);
    this.validateInterval(config.interval);
    this.validateTradeAmount(
      config.defaultTradeAmount,
      config.maxTradeAmount
    );
    this.validateRisk(
      config.stopLoss,
      config.targetProfit
    );

    if (config.maxOpenPosition !== undefined) {
      this.validateMaxPosition(
        config.maxOpenPosition
      );
    }

  }

  /**
   * Validasi pair
   */
  static validatePair(pair: string): void {

    if (!pair || pair.trim() === "") {
      throw AppError.config(
        "Trading pair is required."
      );
    }

    if (!/^[a-z0-9_]+$/i.test(pair)) {
      throw AppError.config(
        `Invalid trading pair: ${pair}`
      );
    }

  }

  /**
   * Validasi mode bot
   */
  static validateMode(mode: string): void {

    if (
      !VALID_MODES.includes(
        mode.toLowerCase() as (typeof VALID_MODES)[number]
      )
    ) {
      throw AppError.config(
        `Unsupported BOT_MODE: ${mode}`
      );
    }

  }

  /**
   * Validasi interval polling
   */
  static validateInterval(interval: number): void {

    if (
      !Number.isFinite(interval) ||
      interval < 10
    ) {
      throw AppError.config(
        "BOT_INTERVAL must be at least 10 seconds."
      );
    }

  }

  /**
   * Validasi nominal trading
   */
  static validateTradeAmount(
    defaultAmount: number,
    maxAmount: number
  ): void {

    if (
      defaultAmount <= 0 ||
      maxAmount <= 0
    ) {
      throw AppError.config(
        "Trade amount must be greater than zero."
      );
    }

    if (defaultAmount > maxAmount) {
      throw AppError.config(
        "Default trade amount cannot exceed maximum trade amount."
      );
    }

  }

  /**
   * Validasi Stop Loss & Target Profit
   */
  static validateRisk(
    stopLoss: number,
    targetProfit: number
  ): void {

    if (
      stopLoss <= 0 ||
      stopLoss > 100
    ) {
      throw AppError.config(
        "Invalid stop loss percentage."
      );
    }

    if (
      targetProfit <= 0 ||
      targetProfit > 100
    ) {
      throw AppError.config(
        "Invalid target profit percentage."
      );
    }

  }

  /**
   * Validasi jumlah posisi terbuka
   */
  static validateMaxPosition(
    maxPosition: number
  ): void {

    if (
      !Number.isInteger(maxPosition) ||
      maxPosition < 1
    ) {
      throw AppError.config(
        "Maximum open position must be at least 1."
      );
    }

  }

}

export default ConfigValidator;
