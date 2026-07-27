/**
==========================================================
AURA Trade OS
Machine Learning Types
Version : 0.1.0 Alpha
==========================================================
*/

export type MLTask =

  | "CLASSIFICATION"
  | "REGRESSION"
  | "CLUSTERING"
  | "REINFORCEMENT"
  | "FORECASTING";

export type MLModelType =

  | "RANDOM_FOREST"
  | "XGBOOST"
  | "LIGHTGBM"
  | "NEURAL_NETWORK"
  | "LSTM"
  | "TRANSFORMER"
  | "CNN"
  | "REINFORCEMENT";

export type PredictionLabel =

  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface FeatureRecord {

  timestamp: number;

  symbol: string;

  timeframe: string;

  values: Record<string, number>;

}

export interface TrainingSample {

  features: FeatureRecord;

  label: PredictionLabel;

}

export interface PredictionResult {

  prediction: PredictionLabel;

  confidence: number;

  probabilities: Partial<
    Record<
      PredictionLabel,
      number
    >
  >;

  model: string;

  createdAt: number;

}

export interface MLMetrics {

  accuracy: number;

  precision: number;

  recall: number;

  f1Score: number;

  loss?: number;

}

export interface TrainingConfig {

  epochs: number;

  batchSize: number;

  learningRate: number;

  validationSplit: number;

}

export interface TrainingResult {

  success: boolean;

  model: string;

  metrics: MLMetrics;

  duration: number;

}

export interface DatasetInfo {

  samples: number;

  features: number;

  createdAt: number;

}

export interface MLModelInfo {

  id: string;

  name: string;

  type: MLModelType;

  task: MLTask;

  version: string;

  trainedAt: number;

  metrics: MLMetrics;

}

export interface PredictionHistory {

  timestamp: number;

  prediction: PredictionLabel;

  actual?: PredictionLabel;

  confidence: number;

}
