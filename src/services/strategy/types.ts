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







/*
==========================================================
Strategy Context
==========================================================
*/


export interface StrategyContext {


    pair:string;


    features:IndicatorFeatureVector;



    mode:StrategyMode;



    position:

        | "NONE"

        | "LONG";



    balance:number;



    timestamp:number;


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



    riskLevel:

        | "LOW"

        | "MEDIUM"

        | "HIGH";



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
