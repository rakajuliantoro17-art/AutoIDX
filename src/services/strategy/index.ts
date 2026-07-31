/**
==========================================================
AURA Trade OS
Strategy Engine
Version : 0.1.0 Alpha
==========================================================
Public Strategy Service Exports
==========================================================
*/



/*
==========================================================
Core Engine
==========================================================
*/


export {

    default as strategyEngine

}

from "./core/strategyEngine";



export {

    default as strategyEvaluator

}

from "./core/evaluator";





/*
==========================================================
Strategy Manager
==========================================================
*/


export {

    default as strategyManager

}

from "./manager";





/*
==========================================================
Strategy Types
==========================================================
*/


export type {

    StrategyDefinition

}

from "./core/strategyEngine";


export type {

    StrategyDecision,

    StrategyAction

}

from "./types";



export type {

    EvaluationRule,

    EvaluationResult,

    EvaluationStatus

}

from "./core/evaluator";



export type {

    StrategyMode,

    StrategyManagerResult

}

from "./manager";





/*
==========================================================
Strategies
==========================================================
*/


export {

    default as auraTrend

}

from "./strategies/auraTrend";



export {

    default as emaCrossover

}

from "./strategies/emaCrossover";



export {

    default as momentumStrategy

}

from "./strategies/momentum";





/*
==========================================================
Rules
==========================================================
*/


export {

    default as entryRules

}

from "./rules/entryRules";



export {

    default as exitRules

}

from "./rules/exitRules";



export {

    default as filterRules

}

from "./rules/filterRules";





/*
==========================================================
Scoring
==========================================================
*/


export {

    default as strategyScore

}

from "./scoring/strategyScore";


