/**
==========================================================
AURA Trade OS
Market Domain Types
Version : 0.1.1 Alpha
==========================================================
*/

export type MarketSymbol = string;


export type Timeframe =

    | "1m"
    | "5m"
    | "15m"
    | "30m"
    | "1h"
    | "4h"
    | "1d";


export type MarketSide =

    | "BUY"
    | "SELL";


export type MarketTrend =

    | "BULLISH"
    | "BEARISH"
    | "SIDEWAYS";


export type VolatilityLevel =

    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "EXTREME";


export type LiquidityLevel =

    | "LOW"
    | "MEDIUM"
    | "HIGH";


/**
 * Generic price level.
 */
export interface PriceLevel {

    price: number;

    volume: number;

}


/**
 * OHLC candle representation.
 */
export interface MarketCandle {

    symbol: MarketSymbol;

    timeframe: Timeframe;

    open: number;

    high: number;

    low: number;

    close: number;

    volume: number;

    timestamp: number;

}


/**
 * Market price state.
 */
export interface MarketPrice {

    symbol: MarketSymbol;

    price: number;

    bid: number;

    ask: number;

    timestamp: number;

}


/**
 * Market liquidity state.
 */
export interface MarketLiquidity {

    bidVolume: number;

    askVolume: number;

    totalVolume: number;

    imbalance: number;

    level: LiquidityLevel;

}


/**
 * Market volatility state.
 */
export interface MarketVolatility {

    value: number;

    level: VolatilityLevel;

}


/**
 * Market condition.
 */
export interface MarketCondition {

    trend: MarketTrend;

    volatility: MarketVolatility;

    liquidity: MarketLiquidity;

}


/**
 * Signal direction.
 */
export interface MarketSignal {

    symbol: MarketSymbol;

    side: MarketSide;

    confidence: number;

    reason: string;

    timestamp: number;

}
