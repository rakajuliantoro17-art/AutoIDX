/**
==========================================================
AURA Trade OS
AI Intelligence Service
Phase 30
Version : 0.0.9 Alpha
==========================================================
*/


/*
==========================================================
AI CONTEXT
==========================================================
*/

export {
    createAIContext,
    completeAIContext,
} from "./aiContext";

export type {
    AIContext,
} from "./aiContext";


/*
==========================================================
PREDICTION
==========================================================
*/

export {
    PredictionEngine,
} from "./prediction/predictionEngine";

export {
    BasicPredictionModel,
} from "./prediction/predictionModel";

export type {
    PredictionModel,
} from "./prediction/predictionModel";

export {
    createPredictionInput,
} from "./prediction/predictionInput";

export type {
    PredictionInput,
} from "./prediction/predictionInput";

export type {
    PredictionOutput,
    PredictionDirection,
} from "./prediction/predictionOutput";

export {
    isPredictionBullish,
    isPredictionBearish,
} from "./prediction/predictionOutput";

export {
    createPredictionContext,
} from "./prediction/predictionContext";

export type {
    PredictionContext,
} from "./prediction/predictionContext";

export {
    PredictionManager,
    predictionManager,
} from "./prediction/predictionManager";


/*
==========================================================
OPTIMIZER
==========================================================
*/

export {
    OptimizerEngine,
} from "./optimizer/optimizerEngine";

export {
    BasicOptimizerModel,
} from "./optimizer/optimizerModel";

export type {
    OptimizerModel,
} from "./optimizer/optimizerModel";

export {
    createOptimizerInput,
} from "./optimizer/optimizerInput";

export type {
    OptimizerInput,
    ParameterBounds,
} from "./optimizer/optimizerInput";

export type {
    OptimizerOutput,
} from "./optimizer/optimizerOutput";

export {
    getOptimizedParameter,
} from "./optimizer/optimizerOutput";

export {
    OptimizerManager,
    optimizerManager,
} from "./optimizer/optimizerManager";


/*
==========================================================
DECISION
==========================================================
*/

export {
    DecisionEngine,
} from "./decision/decisionEngine";

export {
    BasicDecisionModel,
} from "./decision/decisionModel";

export type {
    DecisionModel,
} from "./decision/decisionModel";

export {
    createDecisionInput,
} from "./decision/decisionInput";

export type {
    DecisionInput,
} from "./decision/decisionInput";

export type {
    DecisionOutput,
    TradingDecision,
} from "./decision/decisionOutput";

export {
    isActionableDecision,
} from "./decision/decisionOutput";

export {
    DecisionManager,
    decisionManager,
} from "./decision/decisionManager";


/*
==========================================================
AI MANAGER
==========================================================
*/

export {
    AIManager,
    aiManager,
} from "./aiManager";

export type {
    AIAnalysisRequest,
} from "./aiManager";


/*
==========================================================
AI REGISTRY
==========================================================
*/

export {
    AIRegistry,
    aiRegistry,
} from "./aiRegistry";

export type {
    AIComponentType,
    AIRegistryEntry,
} from "./aiRegistry";
