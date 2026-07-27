/**
==========================================================
AURA Trade OS
ML Model Predictor
Version : 0.1.0 Alpha
==========================================================
*/

import { PredictionLabel } from "../types";
import modelRegistry from "./registry";

export interface PredictionInput {

  features:number[];

}

export interface PredictionResult {

  label:PredictionLabel;

  confidence:number;

  modelId:string;

  durationMs:number;

  timestamp:Date;

}

export class ModelPredictor {

  async predict(

    input:PredictionInput

  ):Promise<PredictionResult>{

    const model =

      modelRegistry.getActive();

    if(!model){

      throw new Error(

        "No active model registered."

      );

    }

    const started =

      performance.now();

    /**
     * Placeholder inference.
     *
     * Phase berikutnya akan
     * diganti dengan adapter:
     *
     * TensorFlow
     * XGBoost
     * ONNX
     * Ensemble
     */

    const score =

      this.simpleScore(

        input.features

      );

    const label =

      this.scoreToLabel(score);

    const confidence =

      Math.min(

        1,

        Math.abs(score)

      );

    const durationMs =

      performance.now()

      -

      started;

    return {

      label,

      confidence,

      modelId:model.id,

      durationMs,

      timestamp:new Date()

    };

  }

  /**
   * Dummy scoring.
   */
  private simpleScore(

    features:number[]

  ):number{

    if(features.length===0){

      return 0;

    }

    const average =

      features.reduce(

        (a,b)=>a+b,

        0

      )

      /

      features.length;

    return average;

  }

  /**
   * Convert score
   * menjadi label.
   */
  private scoreToLabel(

    score:number

  ):PredictionLabel{

    if(score>=0.75){

      return "STRONG_BUY";

    }

    if(score>=0.55){

      return "BUY";

    }

    if(score<=0.25){

      return "STRONG_SELL";

    }

    if(score<=0.45){

      return "SELL";

    }

    return "HOLD";

  }

}

const modelPredictor =

new ModelPredictor();

export default modelPredictor;
