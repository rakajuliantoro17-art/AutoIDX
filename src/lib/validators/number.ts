/**
==========================================================
AURA Trade OS
Number Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";

export class NumberValidator {

  /**
   * Memastikan nilai berupa angka yang valid
   */
  static isNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
  }

  /**
   * Validasi angka
   */
  static validate(
    value: unknown,
    field = "Value"
  ): number {

    const number =
      typeof value === "string"
        ? Number(value)
        : value;

    if (!this.isNumber(number)) {
      throw AppError.validation(
        `${field} must be a valid number.`
      );
    }

    return number;

  }

  /**
   * Harus lebih besar dari nol
   */
  static positive(
    value: unknown,
    field = "Value"
  ): number {

    const number = this.validate(value, field);

    if (number <= 0) {
      throw AppError.validation(
        `${field} must be greater than zero.`
      );
    }

    return number;

  }

  /**
   * Tidak boleh negatif
   */
  static nonNegative(
    value: unknown,
    field = "Value"
  ): number {

    const number = this.validate(value, field);

    if (number < 0) {
      throw AppError.validation(
        `${field} cannot be negative.`
      );
    }

    return number;

  }

  /**
   * Harus berupa integer
   */
  static integer(
    value: unknown,
    field = "Value"
  ): number {

    const number = this.validate(value, field);

    if (!Number.isInteger(number)) {
      throw AppError.validation(
        `${field} must be an integer.`
      );
    }

    return number;

  }

  /**
   * Validasi rentang angka
   */
  static between(
    value: unknown,
    min: number,
    max: number,
    field = "Value"
  ): number {

    const number = this.validate(value, field);

    if (number < min || number > max) {
      throw AppError.validation(
        `${field} must be between ${min} and ${max}.`
      );
    }

    return number;

  }

  /**
   * Validasi persentase (0 - 100)
   */
  static percentage(
    value: unknown,
    field = "Percentage"
  ): number {

    return this.between(
      value,
      0,
      100,
      field
    );

  }

  /**
   * Validasi RSI (0 - 100)
   */
  static rsi(
    value: unknown
  ): number {

    return this.between(
      value,
      0,
      100,
      "RSI"
    );

  }

  /**
   * Validasi harga aset
   */
  static price(
    value: unknown
  ): number {

    return this.positive(
      value,
      "Price"
    );

  }

  /**
   * Validasi jumlah aset
   */
  static amount(
    value: unknown
  ): number {

    return this.positive(
      value,
      "Amount"
    );

  }

  /**
   * Validasi volume perdagangan
   */
  static volume(
    value: unknown
  ): number {

    return this.nonNegative(
      value,
      "Volume"
    );

  }

  /**
   * Membatasi nilai pada rentang tertentu
   */
  static clamp(
    value: number,
    min: number,
    max: number
  ): number {

    return Math.min(
      max,
      Math.max(min, value)
    );

  }

}

export default NumberValidator;
