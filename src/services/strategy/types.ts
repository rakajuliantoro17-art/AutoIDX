/**
==========================================================
AURA Trade OS
Strategy Types
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketSnapshot,

} from "@/services/market";



/*
==========================================================
Signal
==========================================================
*/

export type StrategySignal =

    | "BUY"

    | "SELL"

    | "HOLD";



/*
==========================================================
Market Bias
==========================================================
*/

export type MarketBias =

    | "BULLISH"

    | "BEARISH"

    | "SIDEWAYS";



/*
==========================================================
Risk Level
==========================================================
*/

export type RiskLevel =

    | "LOW"

    | "MEDIUM"

    | "HIGH";



/*
==========================================================
Confidence
==========================================================
*/

export type ConfidenceLevel =

    | "VERY_LOW"

    | "LOW"

    | "MEDIUM"

    | "HIGH"

    | "VERY_HIGH";



/*
==========================================================
Indicator Values
==========================================================
*/

export interface StrategyIndicators {

    ema?: number;

    sma?: number;

    macd?: number;

    macdSignal?: number;

    histogram?: number;

    rsi?: number;

    atr?: number;

    bollingerUpper?: number;

    bollingerMiddle?: number;

    bollingerLower?: number;

    obv?: number;

}



/*
==========================================================
Rule Result
==========================================================
*/

export interface RuleResult {

    passed: boolean;

    score: number;

    reason: string;

}



/*
==========================================================
Strategy Context
==========================================================
*/

export interface StrategyContext {

    snapshot: MarketSnapshot;

    indicators: StrategyIndicators;

}



/*
==========================================================
Strategy Decision
==========================================================
*/

export interface StrategyDecision {

    signal: StrategySignal;

    bias: MarketBias;

    confidence: number;

    confidenceLevel: ConfidenceLevel;

    score: number;

    risk: RiskLevel;

    reasons: string[];

    timestamp: number;

}



/*
==========================================================
Strategy Rule
==========================================================
*/

export interface StrategyRule {

    readonly name: string;

    evaluate(

        context: StrategyContext

    ): RuleResult;

}



/*
==========================================================
Strategy
==========================================================
*/

export interface Strategy {

    readonly id: string;

    readonly name: string;

    readonly version: string;

    evaluate(

        context: StrategyContext

    ): StrategyDecision;

}
