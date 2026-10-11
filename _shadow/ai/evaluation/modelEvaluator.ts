/**
==========================================================
AURA Trade OS
AI Model Evaluator
Phase 32
==========================================================
*/

import type {
    EvaluationDataset,
} from "./evaluationDataset";

import type {
    EvaluationMetric,
} from "./evaluationMetric";

import {
    createEvaluationMetric,
} from "./evaluationMetric";

import type {
    EvaluationResult,
} from "./evaluationResult";

export interface ModelPrediction {
    readonly expected: unknown;
    readonly predicted: unknown;
}

export interface EvaluationPredictionProvider {
    predict(
        input: Record<string, unknown>,
    ): unknown;
}

export class ModelEvaluator {
    public evaluate(
        modelId: string,
        modelVersion: string,
        dataset: EvaluationDataset,
        provider: EvaluationPredictionProvider,
    ): EvaluationResult {
        const startedAt =
            Date.now();

        try {
            const predictions:
                ModelPrediction[] =
                dataset.samples.map(
                    (sample) => ({
                        expected:
                            sample.expected,
                        predicted:
                            provider.predict(
                                sample.input,
                            ),
                    }),
                );

            const metrics =
                this.calculateMetrics(
                    predictions,
                );

            return {
                modelId,
                modelVersion,
                datasetId:
                    dataset.id,
                metrics,
                sampleCount:
                    predictions.length,
                durationMs:
                    Date.now() -
                    startedAt,
                evaluatedAt:
                    Date.now(),
                success: true,
                metadata: {},
            };
        } catch (error) {
            return {
                modelId,
                modelVersion,
                datasetId:
                    dataset.id,
                metrics: [],
                sampleCount: 0,
                durationMs:
                    Date.now() -
                    startedAt,
                evaluatedAt:
                    Date.now(),
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
                metadata: {},
            };
        }
    }

    private calculateMetrics(
        predictions: readonly ModelPrediction[],
    ): readonly EvaluationMetric[] {
        if (
            predictions.length === 0
        ) {
            return [
                createEvaluationMetric(
                    "ACCURACY",
                    0,
                ),
            ];
        }

        let correct = 0;

        for (
            const prediction of predictions
        ) {
            if (
                prediction.expected ===
                prediction.predicted
            ) {
                correct++;
            }
        }

        const accuracy =
            correct /
            predictions.length;

        return [
            createEvaluationMetric(
                "ACCURACY",
                accuracy,
            ),
        ];
    }
}

export default ModelEvaluator;
