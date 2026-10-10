/**
==========================================================
AURA Trade OS
Workflow Result
Version : 0.0.7 Alpha
==========================================================
*/

import {
    WorkflowStatus,
} from "./workflowStatus";


export interface WorkflowResult<
    T = unknown,
> {
    readonly success: boolean;

    readonly workflowId?: string;

    readonly executionId?: string;

    readonly status:
        WorkflowStatus;

    readonly data?: T;

    readonly error?: unknown;

    readonly stepId?: string;

    readonly durationMs?: number;

    readonly timestamp: number;
}


export function createWorkflowSuccess<
    T = unknown,
>(
    data?: T,
    options: {
        readonly workflowId?: string;
        readonly executionId?: string;
        readonly stepId?: string;
    } = {},
): WorkflowResult<T> {

    return {
        success: true,

        workflowId:
            options.workflowId,

        executionId:
            options.executionId,

        status:
            WorkflowStatus.COMPLETED,

        data,

        stepId:
            options.stepId,

        timestamp:
            Date.now(),
    };
}


export function createWorkflowFailure(
    error: unknown,
    options: {
        readonly workflowId?: string;
        readonly executionId?: string;
        readonly stepId?: string;
    } = {},
): WorkflowResult {

    return {
        success: false,

        workflowId:
            options.workflowId,

        executionId:
            options.executionId,

        status:
            WorkflowStatus.FAILED,

        error,

        stepId:
            options.stepId,

        timestamp:
            Date.now(),
    };
}
