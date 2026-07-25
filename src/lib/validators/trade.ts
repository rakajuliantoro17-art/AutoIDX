/**
==========================================================
AURA Trade OS
Trade Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";
import NumberValidator from "./number";
import PairValidator from "./pair";

export type TradeSide = "BUY" | "SELL";

export interface TradeOrder {
  pair: string;
  side: TradeSide;
  price: number;
  amount: number;
  total?: number;
}

export class TradeValidator {

  /**
   * Validasi order trading
   */
  static validate(
    order: TradeOrder
  ): TradeOrder {

    PairValidator.validate(order.pair);

    this.validateSide(order.side);

    NumberValidator.price(
      order.price
    );

    NumberValidator.amount(
      order.amount
    );

    if (order.total !== undefined) {
      NumberValidator.price(
        order.total
      );
    }

    return order;

  }

  /**
   * Validasi BUY / SELL
   */
  static validateSide(
    side: string
  ): TradeSide {

    const normalized =
      side.toUpperCase();

    if (
      normalized !== "BUY" &&
      normalized !== "SELL"
    ) {
      throw AppError.validation(
        "Trade side must be BUY or SELL."
      );
    }

    return normalized as TradeSide;

  }

  /**
   * Hitung total transaksi
   */
  static calculateTotal(
    price: number,
    amount: number
  ): number {

    NumberValidator.price(price);
    NumberValidator.amount(amount);

    return price * amount;

  }

  /**
   * Hitung biaya transaksi
   */
  static calculateFee(
    total: number,
    feePercent = 0.3
  ): number {

    NumberValidator.price(
      total
    );

    NumberValidator.percentage(
      feePercent,
      "Trading Fee"
    );

    return total * (feePercent / 100);

  }

  /**
   * Hitung total setelah fee
   */
  static calculateNetTotal(
    total: number,
    feePercent = 0.3
  ): number {

    const fee =
      this.calculateFee(
        total,
        feePercent
      );

    return total - fee;

  }

  /**
   * Profit/Loss transaksi
   */
  static calculateProfit(
    buyPrice: number,
    sellPrice: number,
    amount: number
  ): number {

    NumberValidator.price(
      buyPrice
    );

    NumberValidator.price(
      sellPrice
    );

    NumberValidator.amount(
      amount
    );

    return (
      sellPrice - buyPrice
    ) * amount;

  }

  /**
   * Profit/Loss (%)
   */
  static calculateProfitPercentage(
    buyPrice: number,
    sellPrice: number
  ): number {

    NumberValidator.price(
      buyPrice
    );

    NumberValidator.price(
      sellPrice
    );

    return (
      (
        (sellPrice - buyPrice) /
        buyPrice
      ) * 100
    );

  }

  /**
   * Validasi saldo mencukupi
   */
  static validateBalance(
    balance: number,
    required: number
  ): void {

    NumberValidator.nonNegative(
      balance,
      "Balance"
    );

    NumberValidator.price(
      required
    );

    if (balance < required) {
      throw AppError.validation(
        "Insufficient balance."
      );
    }

  }

  /**
   * Validasi kepemilikan aset
   */
  static validateAssetAmount(
    owned: number,
    amount: number
  ): void {

    NumberValidator.nonNegative(
      owned,
      "Owned Asset"
    );

    NumberValidator.amount(
      amount
    );

    if (owned < amount) {
      throw AppError.validation(
        "Insufficient asset amount."
      );
    }

  }

}

export default TradeValidator;
