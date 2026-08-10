/**
==========================================================
AURA Trade OS
AI Pipeline
Phase 31
==========================================================
*/

import type {
    FeatureSet,
} from "../features/featureSet";

import type {
    ModelRuntime,
} from "../runtime/modelRuntime";

import type {
    ModelRuntimeConfig,
} from "../runtime/modelRuntimeConfig";

import type {
    AIContext,
} from "../aiContext";

import type {
    AIPipelineResult,
} from "./aiPipelineResult";

export class AIPipeline {
    public constructor(
        private readonly runtime:
            ModelRuntime,
    ) {}

    public execute(
        context: AIContext,
        featureSet: FeatureSet,
        config: ModelRuntimeConfig,
    ): AIPipelineResult {
        const runtimeResult =
            this.runtime.execute(
                featureSet,
                config,
            );

        return {
            success:
                runtimeResult.success,
            context,
            featureSet,
            runtimeResult,
            startedAt:
                Date.now(),
            completedAt:
                Date.now(),
            metadata: {},
        };
    }
}

export default AIPipeline;
