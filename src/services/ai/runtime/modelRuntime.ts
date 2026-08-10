/**
==========================================================
AURA Trade OS
AI Model Runtime
Phase 31
==========================================================
*/

import type {
    FeatureSet,
} from "../features/featureSet";

import type {
    ModelRuntimeConfig,
} from "./modelRuntimeConfig";

import {
    ModelExecutor,
} from "./modelExecutor";

import type {
    ModelRuntimeResult,
} from "./modelRuntimeResult";

export class ModelRuntime {
    public constructor(
        private readonly executor:
            ModelExecutor,
    ) {}

    public execute(
        featureSet: FeatureSet,
        config: ModelRuntimeConfig,
    ): ModelRuntimeResult {
        const startedAt =
            Date.now();

        try {
            const output =
                this.executor.execute(
                    featureSet,
                    config,
                );

            return {
                success: true,
                modelId:
                    config.modelId,
                modelVersion:
                    config.modelVersion,
                output,
                durationMs:
                    Date.now() -
                    startedAt,
                executedAt:
                    Date.now(),
                metadata: {},
            };
        } catch (error) {
            return {
                success: false,
                modelId:
                    config.modelId,
                modelVersion:
                    config.modelVersion,
                durationMs:
                    Date.now() -
                    startedAt,
                executedAt:
                    Date.now(),
                error:
                    error instanceof Error
                        ? error.message
                        : String(error),
                metadata: {},
            };
        }
    }

    public getExecutor():
        ModelExecutor {
        return this.executor;
    }
}

export default ModelRuntime;
