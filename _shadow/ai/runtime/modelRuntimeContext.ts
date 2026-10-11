/**
==========================================================
AURA Trade OS
AI Model Runtime Context
Phase 31
==========================================================
*/

import type {
    FeatureSet,
} from "../features/featureSet";

import type {
    ModelRuntimeConfig,
} from "./modelRuntimeConfig";

import type {
    ModelRuntimeResult,
} from "./modelRuntimeResult";

export interface ModelRuntimeContext {
    readonly requestId: string;
    readonly featureSet: FeatureSet;
    readonly config: ModelRuntimeConfig;
    readonly result?: ModelRuntimeResult;
    readonly startedAt: number;
    readonly completedAt?: number;
    readonly metadata: Record<string, unknown>;
}

export function createModelRuntimeContext(
    featureSet: FeatureSet,
    config: ModelRuntimeConfig,
): ModelRuntimeContext {
    return {
        requestId: createRequestId(),
        featureSet,
        config,
        startedAt: Date.now(),
        metadata: {},
    };
}

export function completeModelRuntimeContext(
    context: ModelRuntimeContext,
    result: ModelRuntimeResult,
): ModelRuntimeContext {
    return {
        ...context,
        result,
        completedAt: Date.now(),
    };
}

function createRequestId(): string {
    return [
        "runtime",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
