/**
==========================================================
AURA Trade OS
AI Model Score
Phase 32
==========================================================
*/

import type {
    EvaluationMetric,
} from "../evaluation/evaluationMetric";

export interface ModelScore {
    readonly modelId: string;
    readonly modelVersion: string;
    readonly score: number;
    readonly metrics:
        readonly EvaluationMetric[];
    readonly rank?: number;
    readonly metadata:
        Record<string, unknown>;
}

export function createModelScore(
    options: {
        readonly modelId: string;
        readonly modelVersion: string;
        readonly score: number;
        readonly metrics?: readonly EvaluationMetric[];
        readonly rank?: number;
        readonly metadata?: Record<string, unknown>;
    },
): ModelScore {
    return {
        modelId: options.modelId,
        modelVersion:
            options.modelVersion,
        score: options.score,
        metrics:
            options.metrics ?? [],
        rank: options.rank,
        metadata:
            options.metadata ?? {},
    };
}
