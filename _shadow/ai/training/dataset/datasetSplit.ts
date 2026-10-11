
/**
==========================================================
AURA Trade OS
AI Training Dataset Split
Phase 33
==========================================================
*/

import type {
    DatasetRecord,
} from "./datasetRecord";

export interface DatasetSplit {
    readonly train:
        readonly DatasetRecord[];

    readonly validation:
        readonly DatasetRecord[];

    readonly test:
        readonly DatasetRecord[];

    readonly trainRatio: number;
    readonly validationRatio: number;
    readonly testRatio: number;
}

export interface DatasetSplitConfig {
    readonly trainRatio?: number;
    readonly validationRatio?: number;
    readonly testRatio?: number;
}

export function splitDatasetChronologically(
    records: readonly DatasetRecord[],
    config: DatasetSplitConfig = {},
): DatasetSplit {
    const trainRatio =
        config.trainRatio ?? 0.70;

    const validationRatio =
        config.validationRatio ?? 0.15;

    const testRatio =
        config.testRatio ?? 0.15;

    validateRatios(
        trainRatio,
        validationRatio,
        testRatio,
    );

    const sorted = [
        ...records,
    ].sort(
        (a, b) =>
            (a.timestamp ?? 0) -
            (b.timestamp ?? 0),
    );

    const trainEnd =
        Math.floor(
            sorted.length *
                trainRatio,
        );

    const validationEnd =
        trainEnd +
        Math.floor(
            sorted.length *
                validationRatio,
        );

    return {
        train: sorted.slice(
            0,
            trainEnd,
        ),

        validation: sorted.slice(
            trainEnd,
            validationEnd,
        ),

        test: sorted.slice(
            validationEnd,
        ),

        trainRatio,
        validationRatio,
        testRatio,
    };
}

function validateRatios(
    train: number,
    validation: number,
    test: number,
): void {
    const ratios = [
        train,
        validation,
        test,
    ];

    for (const ratio of ratios) {
        if (
            ratio <= 0 ||
            ratio >= 1
        ) {
            throw new Error(
                "Dataset split ratios must be between 0 and 1",
            );
        }
    }

    const total =
        train +
        validation +
        test;

    if (
        Math.abs(total - 1) >
        0.000001
    ) {
        throw new Error(
            "Dataset split ratios must sum to 1",
        );
    }
}
