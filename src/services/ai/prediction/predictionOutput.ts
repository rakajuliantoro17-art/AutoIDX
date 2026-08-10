/**
==========================================================
AURA Trade OS
Prediction Output
Phase 30
==========================================================
*/

export type PredictionDirection =
    | "BULLISH"
    | "BEARISH"
    | "NEUTRAL";

export interface PredictionOutput {
    readonly modelId: string;

    readonly modelVersion: string;

    readonly direction:
        PredictionDirection;

    readonly score: number;

    readonly confidence: number;

    readonly horizon: number;

    readonly generatedAt: number;

    readonly metadata:
        Record<string, unknown>;
}

export function isPredictionBullish(
    prediction: PredictionOutput,
): boolean {
    return (
        prediction.direction ===
        "BULLISH"
    );
}

export function isPredictionBearish(
    prediction: PredictionOutput,
): boolean {
    return (
        prediction.direction ===
        "BEARISH"
    );
}
