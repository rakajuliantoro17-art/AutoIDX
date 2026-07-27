/**
==========================================================
AURA Trade OS
Machine Learning Manager
Version : 0.1.0 Alpha
==========================================================
*/

import mlPipeline from "./pipeline";

import {

  FeatureRecord,

  PredictionResult,

  TrainingConfig,

  TrainingResult,

} from "./types";

export interface MLManagerStatus {

  initialized: boolean;

  activeModel: string;

  lastTraining?: number;

  predictionCount: number;

}

export class MLManager {

  private initialized = false;

  private activeModel =

    "baseline";

  private predictionCount = 0;

  private lastTraining?: number;

  /**
   * Initialize ML System
   */

  async initialize(): Promise<void> {

    if (this.initialized) {

      return;

    }

    /**
     * Phase 7
     * Placeholder
     *
     * Phase 8:
     * Load Registry
     * Load Model
     * Warm Cache
     */

    this.initialized = true;

    console.info(

      "[ML] Initialized."

    );

  }

  /**
   * Prediction
   */

  async predict(

    features: FeatureRecord

  ): Promise<PredictionResult> {

    await this.initialize();

    const result =

      await mlPipeline.predict(

        features,

        {

          symbol:

            features.symbol,

          timeframe:

            features.timeframe,

          timestamp:

            features.timestamp,

        }

      );

    if (

      !result.success ||

      !result.prediction

    ) {

      throw new Error(

        "Prediction failed."

      );

    }

    this.predictionCount++;

    return result.prediction;

  }

  /**
   * Train Model
   */

  async train(

    config: TrainingConfig

  ): Promise<TrainingResult> {

    await this.initialize();

    const result =

      await mlPipeline.train(

        config

      );

    if (

      !result.success ||

      !result.training

    ) {

      throw new Error(

        "Training failed."

      );

    }

    this.lastTraining =

      Date.now();

    return result.training;

  }

  /**
   * Switch Active Model
   */

  setActiveModel(

    model: string

  ): void {

    this.activeModel =

      model;

  }

  /**
   * Active Model
   */

  getActiveModel(): string {

    return this.activeModel;

  }

  /**
   * Status
   */

  getStatus(): MLManagerStatus {

    return {

      initialized:

        this.initialized,

      activeModel:

        this.activeModel,

      lastTraining:

        this.lastTraining,

      predictionCount:

        this.predictionCount,

    };

  }

}

const mlManager =

new MLManager();

export default mlManager;
