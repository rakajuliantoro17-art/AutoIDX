/**
==========================================================
AURA Trade OS
AI Model Runtime Config
Phase 31
==========================================================
*/

export interface ModelRuntimeConfig {
    readonly modelId: string;
    readonly modelVersion: string;

    readonly timeoutMs?: number;

    readonly requiredFeatures?:
        readonly string[];

    readonly metadata?:
        Record<string, unknown>;
}

export function createModelRuntimeConfig(
    config: ModelRuntimeConfig,
): ModelRuntimeConfig {
    if (!config.modelId) {
        throw new Error(
            "Model ID is required",
        );
    }

    if (!config.modelVersion) {
        throw new Error(
            "Model version is required",
        );
    }

    return {
        ...config,
        requiredFeatures:
            config.requiredFeatures
                ? [
                      ...config.requiredFeatures,
                  ]
                : [],
        metadata:
            config.metadata ?? {},
    };
}
