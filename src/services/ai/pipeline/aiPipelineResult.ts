/**
==========================================================
AURA Trade OS
AI Pipeline Result
Phase 31
==========================================================
*/

import type {
    AIContext,
} from "../aiContext";

import type {
    FeatureSet,
} from "../features/featureSet";

import type {
    ModelRuntimeResult,
} from "../runtime/modelRuntimeResult";

export interface AIPipelineResult {
    readonly success: boolean;

    readonly context: AIContext;

    readonly featureSet: FeatureSet;

    readonly runtimeResult:
        ModelRuntimeResult;

    readonly startedAt: number;

    readonly completedAt: number;

    readonly error?: string;

    readonly metadata:
        Record<string, unknown>;
}

export function getPipelineOutput(
    result: AIPipelineResult,
):
    Record<string, unknown> | undefined {
    return result.runtimeResult.output;
}
