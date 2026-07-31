/**
==========================================================
AURA Trade OS
Strategy Engine Types
Version : 0.1.0 Alpha
==========================================================
Central Strategy Data Contracts
==========================================================
*/


import type {

    IndicatorFeatureVector

}

from "@/services/indicators";




/*
==========================================================
Trading Action
==========================================================
*/


export type StrategyAction =

    | "BUY"

    | "SELL"

    | "HOLD";






/*
==========================================================
Strategy Mode
==========================================================
*/


export type StrategyMode =

    | "CONSERVATIVE"

    | "BALANCED"

    | "AGGRESSIVE";






/*
==========================================================
Strategy Status
==========================================================
*/


export type StrategyStatus =

    | "ACTIVE"

    | "INACTIVE"

    | "DISABLED";



export type RiskLevel =

    | "LOW"

    | "MEDIUM"

    | "HIGH";


export type ConfidenceLevel =

    | "VERY_HIGH"

    | "HIGH"

    | "MEDIUM"

    | "LOW"

    | "VERY_LOW";


export type MarketBias =

    | "BULLISH"

    | "BEARISH"

    | "SIDEWAYS";






/*
==========================================================
Strategy Context
==========================================================
*/


export interface RuleContextIndicators {


    macd:number;


    histogram:number;


    rsi:number;


    ema:number;


    sma:number;


    atr:number;


    bollingerUpper:number;


    bollingerMiddle:number;


    bollingerLower:number;


    obv:number;

}



export interface RuleContextSnapshot {


    close:number;

}



export interface StrategyContext {


    pair:string;


    features:IndicatorFeatureVector;


    /**
     * Bentuk indikator khusus dipakai services/strategy/rules/*.ts
     * (sistem terpisah, belum tersambung ke evaluator/engine utama).
     */
    indicators:RuleContextIndicators;


    snapshot:RuleContextSnapshot;



    mode:StrategyMode;



    position:

        | "NONE"

        | "LONG";



    balance:number;



    timestamp:number;


}



/*
==========================================================
Strategy Rule (services/strategy/rules/*.ts)
==========================================================
*/


export interface RuleResult {


    passed:boolean;


    score:number;


    reason:string;

}



export interface StrategyRule {


    readonly name:string;


    evaluate(

        context:StrategyContext

    ):RuleResult;

}







/*
==========================================================
Strategy Rule Result
==========================================================
*/


export interface StrategyRuleResult {


    passed:boolean;


    rule:string;


    weight:number;


    message:string;


}








/*
==========================================================
Strategy Evaluation
==========================================================
*/


export interface StrategyEvaluation {


    score:number;


    confidence:number;


    rules:StrategyRuleResult[];



    reasons:string[];



    timestamp:number;


}




/*
==========================================================
Strategy Decision
==========================================================
*/


export interface StrategyDecision {


    pair:string;



    strategy:string;



    action:StrategyAction;



    confidence:number;



    score:number;



    reasons:string[];



    riskLevel:RiskLevel;



    timestamp:number;


}




/*
==========================================================
Strategy Definition
==========================================================
*/


export interface StrategyDefinition {


    name:string;



    description:string;



    version:string;



    status:StrategyStatus;



    execute:

    (

        context:StrategyContext

    )=>StrategyDecision;


}




/*
==========================================================
Strategy Configuration
==========================================================
*/


export interface StrategyConfig {


    activeStrategy:string;



    mode:StrategyMode;



    minimumConfidence:number;



    allowTrading:boolean;


}




/*
==========================================================
Strategy Performance
==========================================================
*/


export interface StrategyPerformance {


    strategy:string;



    totalTrades:number;



    winningTrades:number;



    losingTrades:number;



    winRate:number;



    profitLoss:number;



    maxDrawdown:number;



    timestamp:number;


}




/*
==========================================================
Strategy Registry Item
==========================================================
*/


export interface StrategyRegistryItem {


    name:string;


    description:string;


    version:string;



    status:StrategyStatus;


    strategy:StrategyDefinition;


}
