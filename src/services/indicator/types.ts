/**
==========================================================
AURA Trade OS
Indicator Engine Types
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
Market Candle
==========================================================
*/


export interface IndicatorCandle {


    symbol:string;


    open:number;


    high:number;


    low:number;


    close:number;


    volume:number;


    timestamp:number;


}





/**
==========================================================
Generic Indicator Result
==========================================================
*/


export interface IndicatorResult {


    name:string;


    value:number;


    timestamp:number;


}





/**
==========================================================
EMA
==========================================================
*/


export interface EMAResultSummary {


    fast:number;


    slow:number;


    trend:

        | "BULLISH"

        | "BEARISH"

        | "NEUTRAL";


    timestamp:number;


}





/**
==========================================================
MACD
==========================================================
*/


export interface MACDResultSummary {


    macd:number;


    signal:number;


    histogram:number;


    trend:

        | "BULLISH"

        | "BEARISH"

        | "NEUTRAL";


    timestamp:number;


}





/**
==========================================================
ADX
==========================================================
*/


export interface ADXResultSummary {


    adx:number;


    plusDI:number;


    minusDI:number;


    trend:

        | "STRONG"

        | "WEAK"

        | "SIDEWAYS";


    timestamp:number;


}





/**
==========================================================
RSI
==========================================================
*/


export interface RSIResultSummary {


    value:number;


    zone:

        | "OVERSOLD"

        | "NORMAL"

        | "OVERBOUGHT";


    timestamp:number;


}





/**
==========================================================
Stochastic
==========================================================
*/


export interface StochasticResultSummary {


    k:number;


    d:number;


    zone:

        | "OVERSOLD"

        | "NORMAL"

        | "OVERBOUGHT";


    timestamp:number;


}





/**
==========================================================
ATR
==========================================================
*/


export interface ATRResultSummary {


    value:number;


    volatility:

        | "LOW"

        | "MEDIUM"

        | "HIGH";


    timestamp:number;


}





/**
==========================================================
Bollinger Band
==========================================================
*/


export interface BollingerResultSummary {


    upper:number;


    middle:number;


    lower:number;


    bandwidth:number;


    position:

        | "UPPER"

        | "MIDDLE"

        | "LOWER";


    timestamp:number;


}





/**
==========================================================
Trading Signal
==========================================================
*/


export type IndicatorSignalType =

    | "STRONG_BUY"

    | "BUY"

    | "HOLD"

    | "SELL"

    | "STRONG_SELL";





/**
==========================================================
Signal Result
==========================================================
*/


export interface SignalResult {


    signal:IndicatorSignalType;


    confidence:number;


    score:number;


    reasons:string[];


    timestamp:number;


}





/**
==========================================================
Complete Feature Vector
Used by Intelligence Layer
==========================================================
*/


export interface IndicatorFeatureVector {


    pair:string;


    price:number;


    volume:number;



    // Trend

    emaFast:number;


    emaSlow:number;


    macd:number;


    macdSignal:number;


    macdHistogram:number;


    adx:number;



    // Momentum

    rsi:number;


    stochasticK:number;


    stochasticD:number;



    // Volatility

    atr:number;


    bollingerUpper:number;


    bollingerMiddle:number;


    bollingerLower:number;



    timestamp:number;


}





/**
==========================================================
Indicator Engine Config
==========================================================
*/


export interface IndicatorConfig {


    emaFastPeriod:number;


    emaSlowPeriod:number;


    macdFastPeriod:number;


    macdSlowPeriod:number;


    macdSignalPeriod:number;


    rsiPeriod:number;


    stochasticPeriod:number;


    atrPeriod:number;


    bollingerPeriod:number;


}





/**
==========================================================
Indicator Snapshot
Used by Signal Generator
==========================================================
*/


export interface IndicatorSnapshot {


    emaFast:number;


    emaSlow:number;


    rsi:number;


    macd:number;


    macdSignal:number;


    adx:number;


    stochasticK:number;


    stochasticD:number;


    atr:number;



    bollingerUpper?:number;


    bollingerLower?:number;


}
