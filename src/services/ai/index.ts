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


export {
    createFeature,
    isNumericFeature,
} from "./features/feature";

export type {
    Feature,
    FeatureValue,
    FeatureType,
} from "./features/feature";

export {
    createFeatureSet,
    featureSetToRecord,
    getFeature,
} from "./features/featureSet";

export type {
    FeatureSet,
} from "./features/featureSet";

export {
    FeatureExtractor,
    featureExtractor,
} from "./features/featureExtractor";

export type {
    FeatureExtractionInput,
} from "./features/featureExtractor";

export {
    FeatureNormalizer,
    featureNormalizer,
} from "./features/featureNormalizer";

export type {
    NormalizationMethod,
    NormalizationStats,
} from "./features/featureNormalizer";

export {
    FeatureScaler,
    featureScaler,
} from "./features/featureScaler";

export type {
    FeatureScale,
} from "./features/featureScaler";

export {
    FeatureValidator,
    featureValidator,
} from "./features/featureValidator";

export type {
    FeatureValidationIssue,
    FeatureValidationResult,
} from "./features/featureValidator";

export {
    FeatureRegistry,
    featureRegistry,
} from "./features/featureRegistry";

export type {
    FeatureDefinition,
} from "./features/featureRegistry";


/*
==========================================================
MODEL RUNTIME
==========================================================
*/

export {
    ModelRuntime,
} from "./runtime/modelRuntime";

export {
    createModelRuntimeContext,
    completeModelRuntimeContext,
} from "./runtime/modelRuntimeContext";

export type {
    ModelRuntimeContext,
} from "./runtime/modelRuntimeContext";

export {
    createModelRuntimeConfig,
} from "./runtime/modelRuntimeConfig";

export type {
    ModelRuntimeConfig,
} from "./runtime/modelRuntimeConfig";

export {
    isSuccessfulRuntime,
} from "./runtime/modelRuntimeResult";

export type {
    ModelRuntimeResult,
} from "./runtime/modelRuntimeResult";

export {
    RegistryModelLoader,
    modelLoader,
} from "./runtime/modelLoader";

export type {
    ModelLoader,
} from "./runtime/modelLoader";

export {
    ModelRegistry,
    modelRegistry,
} from "./runtime/modelRegistry";

export type {
    ModelRegistryEntry,
} from "./runtime/modelRegistry";

export {
    BasicModelExecutor,
} from "./runtime/modelExecutor";

export type {
    ModelExecutor,
} from "./runtime/modelExecutor";


/*
==========================================================
AI PIPELINE
==========================================================
*/

export {
    AIPipeline,
} from "./pipeline/aiPipeline";

export {
    createAIPipelineContext,
    setPipelineStage,
} from "./pipeline/aiPipelineContext";

export type {
    AIPipelineContext,
} from "./pipeline/aiPipelineContext";

export {
    getPipelineOutput,
} from "./pipeline/aiPipelineResult";

export type {
    AIPipelineResult,
} from "./pipeline/aiPipelineResult";

export {
    PipelineStage,
} from "./pipeline/aiPipelineStage";

export type {
    AIPipelineStage,
    AIPipelineStageName,
} from "./pipeline/aiPipelineStage";

export {
    AIPipelineManager,
    aiPipelineManager,
} from "./pipeline/aiPipelineManager";

export type {
    AIPipelineRequest,
} from "./pipeline/aiPipelineManager";


/*
==========================================================
PHASE 30 COMPATIBILITY
==========================================================
*/

export {
    AIManager,
    aiManager,
} from "./aiManager";

export type {
    AIAnalysisRequest,
} from "./aiManager";

export {
    AIRegistry,
    aiRegistry,
} from "./aiRegistry";

export type {
    AIContext,
} from "./aiContext";

export {
    createAIContext,
    completeAIContext,
} from "./aiContext";

export * from "./lifecycle";
export * from "./evaluation";

export * from "./selection";

export {
    createEvaluationDataset,
} from "./evaluation/evaluationDataset";

export type {
    EvaluationDataset,
} from "./evaluation/evaluationDataset";

export {
    createEvaluationSample,
} from "./evaluation/evaluationSample";

export type {
    EvaluationSample,
} from "./evaluation/evaluationSample";

export {
    createEvaluationMetric,
} from "./evaluation/evaluationMetric";

export type {
    EvaluationMetric,
    EvaluationMetricName,
} from "./evaluation/evaluationMetric";

export {
    getMetric,
} from "./evaluation/evaluationResult";

export type {
    EvaluationResult,
} from "./evaluation/evaluationResult";

export {
    ModelEvaluator,
} from "./evaluation/modelEvaluator";

export {
    PredictionEvaluator,
    predictionEvaluator,
} from "./evaluation/predictionEvaluator";

export {
    EvaluationManager,
    evaluationManager,
} from "./evaluation/evaluationManager";

export * from "./training";
