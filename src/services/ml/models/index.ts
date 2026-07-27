/**
==========================================================
AURA Trade OS
ML Models Gateway
Version : 0.1.0 Alpha
==========================================================
*/

/*
==========================================================
Trainer
==========================================================
*/

export {

  default as modelTrainer,

  ModelTrainer

} from "./trainer";

/*
==========================================================
Predictor
==========================================================
*/

export {

  default as modelPredictor,

  ModelPredictor

} from "./predictor";

/*
==========================================================
Evaluator
==========================================================
*/

export {

  default as modelEvaluator,

  ModelEvaluator

} from "./evaluator";

/*
==========================================================
Registry
==========================================================
*/

export {

  default as modelRegistry,

  ModelRegistry

} from "./registry";

/*
==========================================================
Shared Types
==========================================================
*/

export type {

  TrainingAlgorithm,

  TrainingConfig,

  TrainingResult,

  TrainingSample

} from "./trainer";

export type {

  PredictionInput,

  PredictionResult

} from "./predictor";

export type {

  EvaluationSample,

  EvaluationReport

} from "./evaluator";

export type {

  ModelMetadata

} from "./registry";
