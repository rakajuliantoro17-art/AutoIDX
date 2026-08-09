/**
==========================================================
AURA Trade OS
Orchestration Result
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    WorkflowResult,
} from "./workflowResult";


export interface OrchestrationResult<
    T = unknown,
> {
    readonly success: boolean;

    readonly orchestrationId: string;

    readonly workflowId?: string;

    readonly executionId?: string;

    readonly data?: T;

    readonly workflowResult?:
        WorkflowResult<T>;

    readonly error?: unknown;

    readonly durationMs: number;

    readonly timestamp: number;
}


export function createOrchestrationSuccess<
    T = unknown,
>(
    orchestrationId: string,
    options: {
        readonly workflowId?: string;
        readonly executionId?: string;
        readonly data?: T;
        readonly workflowResult?:
            WorkflowResult<T>;
        readonly durationMs?: number;
    } = {},
):
    OrchestrationResult<T> {

    return {
        success: true,

        orchestrationId,

        workflowId:
            options.workflowId,

        executionId:
            options.executionId,

        data:
            options.data,

        workflowResult:
            options.workflowResult,

        durationMs:
            options.durationMs ?? 0,

        timestamp:
            Date.now(),
    };
}


export function createOrchestrationFailure(
    orchestrationId: string,
    error: unknown,
    options: {
        readonly workflowId?: string;
        readonly executionId?: string;
        readonly workflowResult?:
            WorkflowResult;
        readonly durationMs?: number;
    } = {},
):
    OrchestrationResult {

    return {
        success: false,

        orchestrationId,

        workflowId:
            options.workflowId,

        executionId:
            options.executionId,

        workflowResult:
            options.workflowResult,

        error,

        durationMs:
            options.durationMs ?? 0,

        timestamp:
            Date.now(),
    };
}
