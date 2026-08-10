/**
==========================================================
AURA Trade OS
Prediction Model
Phase 30
==========================================================
*/

import type {
    PredictionInput,
} from "./predictionInput";

import type {
    PredictionOutput,
} from "./predictionOutput";

export interface PredictionModel {
    readonly id: string;
    readonly version: string;

    predict(
        input: PredictionInput,
    ): PredictionOutput;
}

export class BasicPredictionModel
    implements PredictionModel {
    public readonly id =
        "basic-prediction";

    public readonly version =
        "1.0.0";

    public predict(
        input: PredictionInput,
    ): PredictionOutput {
        const {
            indicators,
        } = input;

        const score =
            calculatePredictionScore(
                indicators,
            );

        const direction =
            score > 0.15
                ? "BULLISH"
                : score < -0.15
                  ? "BEARISH"
                  : "NEUTRAL";

        const confidence =
            Math.min(
                1,
                Math.abs(score),
            );

        return {
            modelId: this.id,
            modelVersion:
                this.version,
            direction,
            score,
            confidence,
            horizon:
                input.horizon,
            generatedAt:
                Date.now(),
            metadata: {
                symbol:
                    input.symbol,
            },
        };
    }
}

function calculatePredictionScore(
    indicators: Record<
        string,
        number | undefined
    >,
): number {
    const values =
        Object.values(indicators)
            .filter(
                (
                    value,
                ): value is number =>
                    typeof value ===
                    "number" &&
                    Number.isFinite(value),
            );

    if (
        values.length === 0
    ) {
        return 0;
    }

    const average =
        values.reduce(
            (
                total,
                value,
            ) =>
                total + value,
            0,
        ) / values.length;

    return Math.max(
        -1,
        Math.min(
            1,
            average,
        ),
    );
}

export default BasicPredictionModel;
