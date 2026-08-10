/**
==========================================================
AURA Trade OS
AI Model Selector
Phase 32
==========================================================
*/

import type {
    EvaluationResult,
} from "../evaluation/evaluationResult";

import type {
    EvaluationMetricName,
} from "../evaluation/evaluationMetric";

import {
    createModelScore,
    type ModelScore,
} from "./modelScore";

export interface ModelSelectionWeights {
    readonly metrics: Partial<
        Record<
            EvaluationMetricName,
            number
        >
    >;
}

export class ModelSelector {
    public score(
        result: EvaluationResult,
        weights: ModelSelectionWeights,
    ): ModelScore {
        let weightedScore = 0;
        let totalWeight = 0;

        for (const metric of result.metrics) {
            const weight =
                weights.metrics[
                    metric.name
                ];

            if (
                typeof weight !==
                "number" ||
                weight <= 0
            ) {
                continue;
            }

            let value =
                metric.value;

            if (
                !metric.higherIsBetter
            ) {
                value =
                    1 /
                    (
                        1 +
                        Math.max(
                            0,
                            value,
                        )
                    );
            }

            weightedScore +=
                value * weight;

            totalWeight += weight;
        }

        const score =
            totalWeight === 0
                ? 0
                : weightedScore /
                  totalWeight;

        return createModelScore({
            modelId:
                result.modelId,
            modelVersion:
                result.modelVersion,
            score,
            metrics:
                result.metrics,
        });
    }

    public rank(
        scores: readonly ModelScore[],
    ): readonly ModelScore[] {
        return [
            ...scores,
        ]
            .sort(
                (a, b) =>
                    b.score - a.score,
            )
            .map(
                (
                    score,
                    index,
                ) => ({
                    ...score,
                    rank: index + 1,
                }),
            );
    }
}

export const modelSelector =
    new ModelSelector();

export default ModelSelector;
