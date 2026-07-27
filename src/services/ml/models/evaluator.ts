/**
==========================================================
AURA Trade OS
ML Model Evaluator
Version : 0.1.0 Alpha
==========================================================
*/

import { PredictionLabel } from "../types";

export interface EvaluationSample {

  actual: PredictionLabel;

  predicted: PredictionLabel;

  confidence?: number;

  profit?: number;

}

export interface EvaluationReport {

  total: number;

  correct: number;

  accuracy: number;

  precision: number;

  recall: number;

  f1Score: number;

  winRate: number;

  averageProfit: number;

}

export class ModelEvaluator {

  evaluate(

    samples: EvaluationSample[]

  ): EvaluationReport {

    const total = samples.length;

    let correct = 0;

    let truePositive = 0;

    let falsePositive = 0;

    let falseNegative = 0;

    let profitableTrades = 0;

    let totalProfit = 0;

    for (const sample of samples) {

      if (sample.actual === sample.predicted) {

        correct++;

      }

      if (

        sample.predicted === "BUY" &&

        sample.actual === "BUY"

      ) {

        truePositive++;

      }

      if (

        sample.predicted === "BUY" &&

        sample.actual !== "BUY"

      ) {

        falsePositive++;

      }

      if (

        sample.predicted !== "BUY" &&

        sample.actual === "BUY"

      ) {

        falseNegative++;

      }

      if (

        sample.profit !== undefined

      ) {

        totalProfit += sample.profit;

      }

      if (

        (sample.profit ?? 0) > 0

      ) {

        profitableTrades++;

      }

    }

    const accuracy =

      total === 0

        ? 0

        : correct / total;

    const precision =

      truePositive + falsePositive === 0

        ? 0

        : truePositive /

          (truePositive + falsePositive);

    const recall =

      truePositive + falseNegative === 0

        ? 0

        : truePositive /

          (truePositive + falseNegative);

    const f1Score =

      precision + recall === 0

        ? 0

        : (2 * precision * recall) /

          (precision + recall);

    const winRate =

      total === 0

        ? 0

        : profitableTrades / total;

    const averageProfit =

      total === 0

        ? 0

        : totalProfit / total;

    return {

      total,

      correct,

      accuracy,

      precision,

      recall,

      f1Score,

      winRate,

      averageProfit

    };

  }

}

const modelEvaluator =

new ModelEvaluator();

export default modelEvaluator;
