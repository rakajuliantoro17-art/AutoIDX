/**
==========================================================
AURA Trade OS
AI Pipeline Stage
Phase 31
==========================================================
*/

import type {
    AIPipelineContext,
} from "./aiPipelineContext";

export type AIPipelineStageName =
    | "FEATURE_EXTRACTION"
    | "FEATURE_NORMALIZATION"
    | "FEATURE_SCALING"
    | "FEATURE_VALIDATION"
    | "MODEL_EXECUTION"
    | "COMPLETED";

export interface AIPipelineStage {
    readonly name: AIPipelineStageName;

    execute(
        context: AIPipelineContext,
    ): AIPipelineContext;
}

export class PipelineStage {
    public constructor(
        public readonly name:
            AIPipelineStageName,
        private readonly handler: (
            context: AIPipelineContext,
        ) => AIPipelineContext,
    ) {}

    public execute(
        context: AIPipelineContext,
    ): AIPipelineContext {
        return this.handler(
            context,
        );
    }
}
