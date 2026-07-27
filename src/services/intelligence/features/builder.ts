/**
==========================================================
AURA Trade OS
Feature Builder
Version : 0.1.0 Alpha
==========================================================
*/

import { FeatureVector } from "../types";

export interface FeatureBuilderInput {

  pair: string;

  price: number;

  volume: number;

  emaFast: number;

  emaSlow: number;

  rsi: number;

  macd: number;

  macdSignal: number;

  macdHistogram: number;

  atr: number;

  adx: number;

  stochasticK: number;

  stochasticD: number;

  bollingerUpper: number;

  bollingerMiddle: number;

  bollingerLower: number;

}

export class FeatureBuilder {

  /**
   * Build Feature Vector
   */
  build(
    input: FeatureBuilderInput
  ): FeatureVector {

    return {

      pair: input.pair,

      price: input.price,

      volume: input.volume,

      emaFast: input.emaFast,

      emaSlow: input.emaSlow,

      rsi: input.rsi,

      macd: input.macd,

      macdSignal: input.macdSignal,

      macdHistogram: input.macdHistogram,

      atr: input.atr,

      adx: input.adx,

      stochasticK: input.stochasticK,

      stochasticD: input.stochasticD,

      bollingerUpper: input.bollingerUpper,

      bollingerMiddle: input.bollingerMiddle,

      bollingerLower: input.bollingerLower,

    };

  }

  /**
   * Validate Feature Vector
   */
  validate(
    feature: FeatureVector
  ): boolean {

    const values = [

      feature.price,

      feature.volume,

      feature.emaFast,

      feature.emaSlow,

      feature.rsi,

      feature.macd,

      feature.macdSignal,

      feature.macdHistogram,

      feature.atr,

      feature.adx,

      feature.stochasticK,

      feature.stochasticD,

      feature.bollingerUpper,

      feature.bollingerMiddle,

      feature.bollingerLower,

    ];

    return values.every(
      value =>
        Number.isFinite(value)
    );

  }

  /**
   * Clone Feature Vector
   */
  clone(
    feature: FeatureVector
  ): FeatureVector {

    return {

      ...feature,

    };

  }

}

const featureBuilder =
  new FeatureBuilder();

export default featureBuilder;
