/**
==========================================================
AURA Trade OS
Prediction Context
Phase 30
==========================================================
*/

import type {
    PredictionInput,
} from "./predictionInput";

import type {
    PredictionOutput,
} from "./predictionOutput";

export interface PredictionContext {
    readonly requestId: string;

    readonly input: PredictionInput;

    readonly output?: PredictionOutput;

    readonly startedAt: number;

    readonly completedAt?: number;

    readonly metadata:
        Record<string, unknown>;
}

export function createPredictionContext(
    input: PredictionInput,
): PredictionContext {
    return {
        requestId:
            createPredictionRequestId(),

        input,

        startedAt:
            Date.now(),

        metadata: {},
    };
}

export function completePredictionContext(
    context: PredictionContext,
    output: PredictionOutput,
): PredictionContext {
    return {
        ...context,
        output,
        completedAt:
            Date.now(),
    };
}

function createPredictionRequestId(): string {
    return [
        "prediction",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}
