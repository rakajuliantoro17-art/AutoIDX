
/**
==========================================================
AURA Trade OS
AI Model Metadata
Phase 32
==========================================================
*/

export interface ModelMetadata {
    readonly modelId: string;
    readonly name: string;
    readonly description?: string;
    readonly framework?: string;
    readonly algorithm?: string;
    readonly featureNames: readonly string[];
    readonly targetName?: string;
    readonly trainingDatasetId?: string;
    readonly trainingStartedAt?: number;
    readonly trainingCompletedAt?: number;
    readonly hyperparameters:
        Record<string, unknown>;
    readonly tags: readonly string[];
    readonly metadata:
        Record<string, unknown>;
}

export function createModelMetadata(
    options: {
        readonly modelId: string;
        readonly name: string;
        readonly description?: string;
        readonly framework?: string;
        readonly algorithm?: string;
        readonly featureNames?: readonly string[];
        readonly targetName?: string;
        readonly trainingDatasetId?: string;
        readonly trainingStartedAt?: number;
        readonly trainingCompletedAt?: number;
        readonly hyperparameters?: Record<string, unknown>;
        readonly tags?: readonly string[];
        readonly metadata?: Record<string, unknown>;
    },
): ModelMetadata {
    return {
        modelId: options.modelId,
        name: options.name,
        description: options.description,
        framework: options.framework,
        algorithm: options.algorithm,
        featureNames:
            options.featureNames ?? [],
        targetName: options.targetName,
        trainingDatasetId:
            options.trainingDatasetId,
        trainingStartedAt:
            options.trainingStartedAt,
        trainingCompletedAt:
            options.trainingCompletedAt,
        hyperparameters:
            options.hyperparameters ?? {},
        tags: options.tags ?? [],
        metadata:
            options.metadata ?? {},
    };
}
