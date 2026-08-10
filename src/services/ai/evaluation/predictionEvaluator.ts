/**
==========================================================
AURA Trade OS
AI Prediction Evaluator
Phase 32
==========================================================
*/

export interface ClassificationCounts {
    readonly truePositive: number;
    readonly trueNegative: number;
    readonly falsePositive: number;
    readonly falseNegative: number;
}

export class PredictionEvaluator {
    public confusionMatrix(
        expected: readonly unknown[],
        predicted: readonly unknown[],
        positiveLabel: unknown = 1,
    ): ClassificationCounts {
        if (
            expected.length !==
            predicted.length
        ) {
            throw new Error(
                "Expected and predicted arrays must have equal length",
            );
        }

        let truePositive = 0;
        let trueNegative = 0;
        let falsePositive = 0;
        let falseNegative = 0;

        for (
            let i = 0;
            i < expected.length;
            i++
        ) {
            const actualPositive =
                expected[i] ===
                positiveLabel;

            const predictedPositive =
                predicted[i] ===
                positiveLabel;

            if (
                actualPositive &&
                predictedPositive
            ) {
                truePositive++;
            } else if (
                !actualPositive &&
                !predictedPositive
            ) {
                trueNegative++;
            } else if (
                !actualPositive &&
                predictedPositive
            ) {
                falsePositive++;
            } else {
                falseNegative++;
            }
        }

        return {
            truePositive,
            trueNegative,
            falsePositive,
            falseNegative,
        };
    }

    public precision(
        counts: ClassificationCounts,
    ): number {
        const denominator =
            counts.truePositive +
            counts.falsePositive;

        return denominator === 0
            ? 0
            : counts.truePositive /
                  denominator;
    }

    public recall(
        counts: ClassificationCounts,
    ): number {
        const denominator =
            counts.truePositive +
            counts.falseNegative;

        return denominator === 0
            ? 0
            : counts.truePositive /
                  denominator;
    }

    public f1(
        counts: ClassificationCounts,
    ): number {
        const precision =
            this.precision(counts);

        const recall =
            this.recall(counts);

        const denominator =
            precision + recall;

        return denominator === 0
            ? 0
            : (2 *
                  precision *
                  recall) /
                  denominator;
    }

    public meanAbsoluteError(
        expected: readonly number[],
        predicted: readonly number[],
    ): number {
        this.validateLengths(
            expected,
            predicted,
        );

        if (expected.length === 0) {
            return 0;
        }

        return (
            expected.reduce(
                (
                    total,
                    value,
                    index,
                ) =>
                    total +
                    Math.abs(
                        value -
                            predicted[
                                index
                            ],
                    ),
                0,
            ) /
            expected.length
        );
    }

    public meanSquaredError(
        expected: readonly number[],
        predicted: readonly number[],
    ): number {
        this.validateLengths(
            expected,
            predicted,
        );

        if (expected.length === 0) {
            return 0;
        }

        return (
            expected.reduce(
                (
                    total,
                    value,
                    index,
                ) => {
                    const error =
                        value -
                        predicted[index];

                    return (
                        total +
                        error *
                            error
                    );
                },
                0,
            ) /
            expected.length
        );
    }

    public rootMeanSquaredError(
        expected: readonly number[],
        predicted: readonly number[],
    ): number {
        return Math.sqrt(
            this.meanSquaredError(
                expected,
                predicted,
            ),
        );
    }

    private validateLengths(
        expected: readonly unknown[],
        predicted: readonly unknown[],
    ): void {
        if (
            expected.length !==
            predicted.length
        ) {
            throw new Error(
                "Expected and predicted arrays must have equal length",
            );
        }
    }
}

export const predictionEvaluator =
    new PredictionEvaluator();

export default PredictionEvaluator;
