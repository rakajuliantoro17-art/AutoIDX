/**
==========================================================
AURA Trade OS
Portfolio Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";
import NumberValidator from "./number";
import PairValidator from "./pair";

export interface PortfolioPosition {
  pair: string;
  coinAmount: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  unrealizedPnL?: number;
}

export class PortfolioValidator {

  /**
   * Validasi satu posisi portfolio
   */
  static validate(
    position: PortfolioPosition
  ): PortfolioPosition {

    PairValidator.validate(position.pair);

    NumberValidator.nonNegative(
      position.coinAmount,
      "Coin Amount"
    );

    NumberValidator.nonNegative(
      position.averageBuyPrice,
      "Average Buy Price"
    );

    NumberValidator.nonNegative(
      position.currentPrice,
      "Current Price"
    );

    NumberValidator.nonNegative(
      position.totalInvested,
      "Total Invested"
    );

    NumberValidator.nonNegative(
      position.currentValue,
      "Current Value"
    );

    if (
      position.unrealizedPnL !== undefined
    ) {
      NumberValidator.validate(
        position.unrealizedPnL,
        "Unrealized PnL"
      );
    }

    return position;

  }

  /**
   * Validasi array portfolio
   */
  static validateMany(
    portfolio: PortfolioPosition[]
  ): PortfolioPosition[] {

    if (!Array.isArray(portfolio)) {
      throw AppError.validation(
        "Portfolio must be an array."
      );
    }

    return portfolio.map((item) =>
      this.validate(item)
    );

  }

  /**
   * Menghitung nilai portfolio
   */
  static calculateCurrentValue(
    coinAmount: number,
    currentPrice: number
  ): number {

    NumberValidator.nonNegative(
      coinAmount,
      "Coin Amount"
    );

    NumberValidator.nonNegative(
      currentPrice,
      "Current Price"
    );

    return coinAmount * currentPrice;

  }

  /**
   * Menghitung Profit / Loss
   */
  static calculatePnL(
    totalInvested: number,
    currentValue: number
  ): number {

    NumberValidator.nonNegative(
      totalInvested,
      "Total Invested"
    );

    NumberValidator.nonNegative(
      currentValue,
      "Current Value"
    );

    return currentValue - totalInvested;

  }

  /**
   * Menghitung Return (%)
   */
  static calculateReturnPercentage(
    totalInvested: number,
    currentValue: number
  ): number {

    NumberValidator.positive(
      totalInvested,
      "Total Invested"
    );

    return (
      ((currentValue - totalInvested) /
        totalInvested) *
      100
    );

  }

  /**
   * Mengecek apakah posisi kosong
   */
  static isEmpty(
    coinAmount: number
  ): boolean {

    NumberValidator.nonNegative(
      coinAmount,
      "Coin Amount"
    );

    return coinAmount === 0;

  }

  /**
   * Mengecek apakah sedang memiliki posisi
   */
  static hasPosition(
    coinAmount: number
  ): boolean {

    return !this.isEmpty(
      coinAmount
    );

  }

}

export default PortfolioValidator;
