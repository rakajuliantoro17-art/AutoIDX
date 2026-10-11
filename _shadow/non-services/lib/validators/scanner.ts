/**
==========================================================
AURA Trade OS
Market Scanner Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";
import NumberValidator from "./number";
import PairValidator from "./pair";

export interface ScannerCriteria {
  pairs: string[];
  minVolumeIdr: number;
  maxRsi: number;
  requireBullishEma: boolean;
  minimumOpportunityScore?: number;
}

export class ScannerValidator {

  /**
   * Validasi konfigurasi scanner
   */
  static validate(
    criteria: ScannerCriteria
  ): ScannerCriteria {

    this.validatePairs(criteria.pairs);

    this.validateMinimumVolume(
      criteria.minVolumeIdr
    );

    this.validateMaximumRsi(
      criteria.maxRsi
    );

    if (criteria.minimumOpportunityScore !== undefined) {
      this.validateOpportunityScore(
        criteria.minimumOpportunityScore
      );
    }

    return criteria;

  }

  /**
   * Validasi daftar pair
   */
  static validatePairs(
    pairs: string[]
  ): string[] {

    if (!Array.isArray(pairs)) {
      throw AppError.validation(
        "Pairs must be an array."
      );
    }

    if (pairs.length === 0) {
      throw AppError.validation(
        "At least one trading pair is required."
      );
    }

    return pairs.map((pair) =>
      PairValidator.validate(pair)
    );

  }

  /**
   * Validasi minimum volume perdagangan
   */
  static validateMinimumVolume(
    volume: number
  ): number {

    return NumberValidator.nonNegative(
      volume,
      "Minimum Volume"
    );

  }

  /**
   * Validasi batas maksimum RSI
   */
  static validateMaximumRsi(
    rsi: number
  ): number {

    return NumberValidator.rsi(rsi);

  }

  /**
   * Validasi Opportunity Score
   */
  static validateOpportunityScore(
    score: number
  ): number {

    return NumberValidator.between(
      score,
      0,
      100,
      "Opportunity Score"
    );

  }

  /**
   * Validasi hasil scanner
   */
  static validateResult(
    result: {
      pair: string;
      lastPrice: number;
      volume: number;
      rsi: number;
      emaFast: number;
      emaSlow: number;
      opportunityScore: number;
    }
  ) {

    PairValidator.validate(result.pair);

    NumberValidator.price(result.lastPrice);

    NumberValidator.nonNegative(
      result.volume,
      "Volume"
    );

    NumberValidator.rsi(result.rsi);

    NumberValidator.price(result.emaFast);

    NumberValidator.price(result.emaSlow);

    this.validateOpportunityScore(
      result.opportunityScore
    );

    return result;

  }

  /**
   * Menentukan apakah pair layak diproses
   */
  static isQualified(
    result: {
      volume: number;
      rsi: number;
      emaFast: number;
      emaSlow: number;
      opportunityScore: number;
    },
    criteria: ScannerCriteria
  ): boolean {

    if (result.volume < criteria.minVolumeIdr) {
      return false;
    }

    if (result.rsi > criteria.maxRsi) {
      return false;
    }

    if (
      criteria.requireBullishEma &&
      result.emaFast <= result.emaSlow
    ) {
      return false;
    }

    if (
      criteria.minimumOpportunityScore !== undefined &&
      result.opportunityScore <
        criteria.minimumOpportunityScore
    ) {
      return false;
    }

    return true;

  }

}

export default ScannerValidator;
