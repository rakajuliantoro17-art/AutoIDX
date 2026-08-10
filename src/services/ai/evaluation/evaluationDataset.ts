/**
==========================================================
AURA Trade OS
AI Evaluation Dataset
Phase 32
==========================================================
*/

import type {
    EvaluationSample,
} from "./evaluationSample";

export interface EvaluationDataset {
    readonly id: string;
    readonly name: string;
    readonly samples:
        readonly EvaluationSample[];
    readonly createdAt: number;
    readonly metadata:
        Record<string, unknown>;
}

export function createEvaluationDataset(
    options: {
        readonly name: string;
        readonly samples?: readonly EvaluationSample[];
        readonly metadata?: Record<string, unknown>;
    },
): EvaluationDataset {
    return {
        id: createDatasetId(),
        name: options.name,
        samples: options.samples ?? [],
        createdAt: Date.now(),
        metadata:
            options.metadata ?? {},
    };
}

function createDatasetId(): string {
    return [
        "eval-dataset",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
