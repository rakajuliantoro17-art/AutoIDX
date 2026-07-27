/**
==========================================================
AURA Trade OS
Feature Vector Engine
Version : 0.1.0 Alpha
==========================================================
*/

import { FeatureVector } from "../types";

export class FeatureVectorEngine {

  /**
   * Copy Feature Vector
   */
  clone(
    vector: FeatureVector
  ): FeatureVector {

    return {

      ...vector,

    };

  }

  /**
   * Serialize
   */
  toJSON(
    vector: FeatureVector
  ): string {

    return JSON.stringify(vector);

  }

  /**
   * Deserialize
   */
  fromJSON(
    json: string
  ): FeatureVector {

    return JSON.parse(json);

  }

  /**
   * Convert to Array
   *
   * Dipakai ML
   */
  toArray(
    vector: FeatureVector
  ): number[] {

    return [

      vector.price,

      vector.volume,

      vector.emaFast,

      vector.emaSlow,

      vector.rsi,

      vector.macd,

      vector.macdSignal,

      vector.macdHistogram,

      vector.atr,

      vector.adx,

      vector.stochasticK,

      vector.stochasticD,

      vector.bollingerUpper,

      vector.bollingerMiddle,

      vector.bollingerLower,

    ];

  }

  /**
   * Feature Count
   */
  dimension(): number {

    return 15;

  }

  /**
   * Validate
   */
  validate(
    vector: FeatureVector
  ): boolean {

    return this.toArray(vector)

      .every(Number.isFinite);

  }

  /**
   * Pretty Print
   */
  summary(
    vector: FeatureVector
  ): string {

    return `

Price : ${vector.price}

EMA : ${vector.emaFast}/${vector.emaSlow}

RSI : ${vector.rsi}

MACD : ${vector.macd}

ATR : ${vector.atr}

ADX : ${vector.adx}

`;

  }

}

const featureVector =
  new FeatureVectorEngine();

export default featureVector;
