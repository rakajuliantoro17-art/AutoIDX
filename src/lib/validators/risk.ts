/**
==========================================================
AURA Trade OS
Risk Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";
import NumberValidator from "./number";

export interface RiskConfiguration {
  stopLossPercent: number;
  takeProfitPercent: number;
  maxOpenPosition: number;
  maxDailyLossPercent?: number;
  maxExposurePercent?: number;
}

export class RiskValidator {

  /**
   * Validasi konfigurasi risk management
   */
  static validate(
    config: RiskConfiguration
  ): RiskConfiguration {

    this.validateStopLoss(
      config.stopLossPercent
    );

    this.validateTakeProfit(
      config.takeProfitPercent
    );

    this.validateRiskReward(
      config.stopLossPercent,
      config.takeProfitPercent
    );

    this.validateMaxOpenPosition(
      config.maxOpenPosition
    );

    if (config.maxDailyLossPercent !== undefined) {
      this.validateDailyLoss(
        config.maxDailyLossPercent
      );
    }

    if (config.maxExposurePercent !== undefined) {
      this.validateExposure(
        config.maxExposurePercent
      );
    }

    return config;

  }

  /**
   * Stop Loss (%)
   */
  static validateStopLoss(
    value: number
  ): number {

    return NumberValidator.between(
      value,
      0.1,
      100,
      "Stop Loss"
    );

  }

  /**
   * Take Profit (%)
   */
  static validateTakeProfit(
    value: number
  ): number {

    return NumberValidator.between(
      value,
      0.1,
      100,
      "Take Profit"
    );

  }

  /**
   * Risk Reward Ratio
   * TP minimal sama dengan SL
   */
  static validateRiskReward(
    stopLoss: number,
    takeProfit: number
  ): void {

    if (takeProfit < stopLoss) {
      throw AppError.validation(
        "Take Profit should be greater than or equal to Stop Loss."
      );
    }

  }

  /**
   * Maksimal posisi terbuka
   */
  static validateMaxOpenPosition(
    value: number
  ): number {

    return NumberValidator.integer(
      NumberValidator.between(
        value,
        1,
        20,
        "Maximum Open Position"
      ),
      "Maximum Open Position"
    );

  }

  /**
   * Daily Loss Limit (%)
   */
  static validateDailyLoss(
    value: number
  ): number {

    return NumberValidator.between(
      value,
      0.1,
      100,
      "Maximum Daily Loss"
    );

  }

  /**
   * Maximum Exposure (%)
   */
  static validateExposure(
    value: number
  ): number {

    return NumberValidator.between(
      value,
      1,
      100,
      "Maximum Exposure"
    );

  }

  /**
   * Apakah Stop Loss telah tersentuh
   */
  static shouldStopLoss(
    buyPrice: number,
    currentPrice: number,
    stopLossPercent: number
  ): boolean {

    NumberValidator.price(buyPrice);
    NumberValidator.price(currentPrice);

    this.validateStopLoss(stopLossPercent);

    const loss =
      ((buyPrice - currentPrice) / buyPrice) * 100;

    return loss >= stopLossPercent;

  }

  /**
   * Apakah Target Profit telah tercapai
   */
  static shouldTakeProfit(
    buyPrice: number,
    currentPrice: number,
    takeProfitPercent: number
  ): boolean {

    NumberValidator.price(buyPrice);
    NumberValidator.price(currentPrice);

    this.validateTakeProfit(takeProfitPercent);

    const profit =
      ((currentPrice - buyPrice) / buyPrice) * 100;

    return profit >= takeProfitPercent;

  }

}

export default RiskValidator;
