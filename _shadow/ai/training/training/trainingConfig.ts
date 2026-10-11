/**
==========================================================
AURA Trade OS
AI Training Configuration
Phase 33
==========================================================
*/

export type TrainingAlgorithm =
    | "CUSTOM"
    | "LOGISTIC_REGRESSION"
    | "RANDOM_FOREST"
    | "GRADIENT_BOOSTING"
    | "NEURAL_NETWORK"
    | "XGBOOST"
    | "LIGHTGBM";

export interface TrainingConfig {
    readonly algorithm: TrainingAlgorithm;

    readonly target:
        string;

    readonly epochs?: number;

    readonly learningRate?: number;

    readonly batchSize?: number;

    readonly validationSplit: number;

    readonly testSplit: number;

    readonly randomSeed?: number;

    readonly normalizeFeatures: boolean;

    readonly hyperparameters:
        Record<string, unknown>;

    readonly metadata:
        Record<string, unknown>;
}

export function createTrainingConfig(
    options: {
        readonly algorithm: TrainingAlgorithm;
        readonly target: string;
        readonly epochs?: number;
        readonly learningRate?: number;
        readonly batchSize?: number;
        readonly validationSplit?: number;
        readonly testSplit?: number;
        readonly randomSeed?: number;
        readonly normalizeFeatures?: boolean;
        readonly hyperparameters?: Record<string, unknown>;
        readonly metadata?: Record<string, unknown>;
    },
): TrainingConfig {
    const validationSplit =
        options.validationSplit ??
        0.15;

    const testSplit =
        options.testSplit ?? 0.15;

    if (
        validationSplit <= 0 ||
        testSplit <= 0 ||
        validationSplit +
            testSplit >=
            1
    ) {
        throw new Error(
            "Invalid validation/test split configuration",
        );
    }

    return {
        algorithm:
            options.algorithm,
        target: options.target,
        epochs: options.epochs,
        learningRate:
            options.learningRate,
        batchSize:
            options.batchSize,
        validationSplit,
        testSplit,
        randomSeed:
            options.randomSeed,
        normalizeFeatures:
            options.normalizeFeatures ??
            true,
        hyperparameters:
            options.hyperparameters ??
            {},
        metadata:
            options.metadata ?? {},
    };
}
