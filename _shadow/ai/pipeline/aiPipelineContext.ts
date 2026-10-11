/**
==========================================================
AURA Trade OS
AI Pipeline Context
Phase 31
==========================================================
*/

import type {
    AIContext,
} from "../aiContext";

import type {
    FeatureSet,
} from "../features/featureSet";

export interface AIPipelineContext {
    readonly requestId: string;
    readonly aiContext: AIContext;
    readonly featureSet?: FeatureSet;
    readonly stage: string;
    readonly startedAt: number;
    readonly metadata: Record<string, unknown>;
}

export function createAIPipelineContext(
    aiContext: AIContext,
): AIPipelineContext {
    return {
        requestId: createPipelineRequestId(),
        aiContext,
        stage: "INITIALIZED",
        startedAt: Date.now(),
        metadata: {},
    };
}

export function setPipelineStage(
    context: AIPipelineContext,
    stage: string,
    featureSet?: FeatureSet,
): AIPipelineContext {
    return {
        ...context,
        stage,
        featureSet:
            featureSet ??
            context.featureSet,
    };
}

function createPipelineRequestId(): string {
    return [
        "pipeline",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
