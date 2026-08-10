/**
==========================================================
AURA Trade OS
Decision Input
Phase 30
==========================================================
*/

import type {
    PredictionOutput,
} from "../prediction/predictionOutput";

import type {
    OptimizerOutput,
} from "../optimizer/optimizerOutput";

export interface DecisionInput {
    readonly symbol: string;

    readonly prediction:
        PredictionOutput;

    readonly optimization?:
        OptimizerOutput;

    readonly riskScore: number;

    readonly portfolioExposure?:
        number;

    readonly availableBalance?:
        number;

    readonly metadata?:
        Record<string, unknown>;
}

export function createDecisionInput(
    input: DecisionInput,
): DecisionInput {
    if (!input.symbol) {
        throw new Error(
            "Decision symbol is required",
        );
    }

    if (
        !Number.isFinite(
            input.riskScore,
        )
    ) {
        throw new Error(
            "Decision risk score must be finite",
        );
    }

    return {
        ...input,
        metadata: {
            ...input.metadata,
        },
    };
}
