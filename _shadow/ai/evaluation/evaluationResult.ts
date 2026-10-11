/**
==========================================================
AURA Trade OS
AI Evaluation Result
Phase 32
==========================================================
*/

import type {
    EvaluationMetric,
} from "./evaluationMetric";

export interface EvaluationResult {
    readonly modelId: string;
    readonly modelVersion: string;
    readonly datasetId: string;
    readonly metrics:
        readonly EvaluationMetric[];
    readonly sampleCount: number;
    readonly durationMs: number;
    readonly evaluatedAt: number;
    readonly success: boolean;
    readonly error?: string;
    readonly metadata:
        Record<string, unknown>;
}

export function getMetric(
    result: EvaluationResult,
    name: string,
):
    | EvaluationMetric
    | undefined {
    return result.metrics.find(
        (metric) =>
            metric.name === name,
    );
}
