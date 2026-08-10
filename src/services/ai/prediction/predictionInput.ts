/**
==========================================================
AURA Trade OS
Prediction Input
Phase 30
==========================================================
*/

export interface PredictionInput {
    readonly symbol: string;

    readonly timeframe?: string;

    readonly horizon: number;

    readonly price?: number;

    readonly indicators:
        Record<
            string,
            number | undefined
        >;

    readonly features?:
        Record<
            string,
            number | undefined
        >;

    readonly metadata?:
        Record<string, unknown>;
}

export function createPredictionInput(
    input: PredictionInput,
): PredictionInput {
    if (!input.symbol) {
        throw new Error(
            "Prediction symbol is required",
        );
    }

    if (
        !Number.isFinite(
            input.horizon,
        ) ||
        input.horizon <= 0
    ) {
        throw new Error(
            "Prediction horizon must be positive",
        );
    }

    return {
        ...input,
        indicators: {
            ...input.indicators,
        },
        features: {
            ...input.features,
        },
        metadata: {
            ...input.metadata,
        },
    };
}
