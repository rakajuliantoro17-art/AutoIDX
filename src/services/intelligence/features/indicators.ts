/**
==========================================================
AURA Trade OS
Feature Indicator Aggregator
Version : 0.1.0 Alpha
==========================================================
*/

import calculateEMA from "@/services/indicators/ema";
import calculateMACD from "@/services/indicators/macd";
import calculateATR from "@/services/indicators/atr";
import calculateADX from "@/services/indicators/adx";
import calculateStochastic from "@/services/indicators/stochastic";
import calculateBollingerBands from "@/services/indicators/bollingerBands";

export interface IndicatorInput {

  closes: number[];

  highs: number[];

  lows: number[];

  volumes: number[];

}

export interface IndicatorSnapshot {

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

export class IndicatorAggregator {

  build(
    input: IndicatorInput
  ): IndicatorSnapshot {

    const {

      closes,

      highs,

      lows,

      volumes,

    } = input;

    const price =
      closes.at(-1) ?? 0;

    const volume =
      volumes.at(-1) ?? 0;

    const emaFast =
      calculateEMA(
        closes,
        9
      );

    const emaSlow =
      calculateEMA(
        closes,
        21
      );

    const macd =
      calculateMACD(closes);

    const atr =
      calculateATR(
        highs,
        lows,
        closes
      );

    const adx =
      calculateADX(
        highs,
        lows,
        closes
      );

    const stochastic =
      calculateStochastic(
        highs,
        lows,
        closes
      );

    const bollinger =
      calculateBollingerBands(
        closes
      );

    return {

      price,

      volume,

      emaFast,

      emaSlow,

      rsi: macd.rsi,

      macd: macd.macd,

      macdSignal: macd.signal,

      macdHistogram:
        macd.histogram,

      atr,

      adx,

      stochasticK:
        stochastic.k,

      stochasticD:
        stochastic.d,

      bollingerUpper:
        bollinger.upper,

      bollingerMiddle:
        bollinger.middle,

      bollingerLower:
        bollinger.lower,

    };

  }

}

const featureIndicators =
  new IndicatorAggregator();

export default featureIndicators;
