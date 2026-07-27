/**
==========================================================
AURA Trade OS
Feature Normalization Engine
Version : 0.1.0 Alpha
==========================================================
*/

import { FeatureVector } from "../types";

export type NormalizationMethod =
  | "NONE"
  | "MIN_MAX"
  | "Z_SCORE";

export interface NormalizationOptions {

  method?: NormalizationMethod;

}

export class FeatureNormalization {

  normalize(
    feature: FeatureVector,
    options: NormalizationOptions = {}
  ): FeatureVector {

    const method =
      options.method ?? "MIN_MAX";

    const normalized = {

      ...feature,

      price: this.safe(feature.price),

      volume: this.safe(feature.volume),

      emaFast: this.safe(feature.emaFast),

      emaSlow: this.safe(feature.emaSlow),

      rsi: this.normalizeRSI(feature.rsi),

      macd: this.normalizeValue(
        feature.macd,
        method
      ),

      macdSignal: this.normalizeValue(
        feature.macdSignal,
        method
      ),

      macdHistogram: this.normalizeValue(
        feature.macdHistogram,
        method
      ),

      atr: this.normalizeValue(
        feature.atr,
        method
      ),

      adx: this.normalizeADX(
        feature.adx
      ),

      stochasticK:
        this.normalizeStochastic(
          feature.stochasticK
        ),

      stochasticD:
        this.normalizeStochastic(
          feature.stochasticD
        ),

      bollingerUpper: this.safe(
        feature.bollingerUpper
      ),

      bollingerMiddle: this.safe(
        feature.bollingerMiddle
      ),

      bollingerLower: this.safe(
        feature.bollingerLower
      ),

    };

    return normalized;

  }

  /**
   * Generic normalization
   */
  private normalizeValue(

    value: number,

    method: NormalizationMethod

  ): number {

    value = this.safe(value);

    switch (method) {

      case "NONE":

        return value;

      case "MIN_MAX":

        return Math.tanh(value);

      case "Z_SCORE":

        return value;

      default:

        return value;

    }

  }

  /**
   * RSI 0-100 → 0-1
   */
  private normalizeRSI(
    value: number
  ): number {

    return this.clamp(
      value / 100
    );

  }

  /**
   * ADX 0-100 → 0-1
   */
  private normalizeADX(
    value: number
  ): number {

    return this.clamp(
      value / 100
    );

  }

  /**
   * Stochastic 0-100 → 0-1
   */
  private normalizeStochastic(
    value: number
  ): number {

    return this.clamp(
      value / 100
    );

  }

  /**
   * Clamp
   */
  private clamp(
    value: number
  ): number {

    return Math.max(
      0,
      Math.min(1, this.safe(value))
    );

  }

  /**
   * Safe Number
   */
  private safe(
    value: number
  ): number {

    if (
      Number.isNaN(value) ||
      !Number.isFinite(value)
    ) {

      return 0;

    }

    return value;

  }

}

const featureNormalization =
  new FeatureNormalization();

export default featureNormalization;
