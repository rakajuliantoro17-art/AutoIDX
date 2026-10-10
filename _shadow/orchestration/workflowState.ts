/**
==========================================================
AURA Trade OS
Workflow State
Version : 0.0.7 Alpha
==========================================================
*/

import {
    WorkflowStatus,
} from "./workflowStatus";


export interface WorkflowState {
    readonly workflowId: string;

    readonly executionId: string;

    status: WorkflowStatus;

    currentStepIndex: number;

    currentStepId?: string;

    input?: unknown;

    output?: unknown;

    error?: unknown;

    startedAt?: number;

    completedAt?: number;

    updatedAt: number;

    retries:
        Record<string, number>;

    data:
        Record<string, unknown>;
}


export function createWorkflowState(
    workflowId: string,
    executionId: string,
    input?: unknown,
):
    WorkflowState {

    return {
        workflowId,

        executionId,

        status:
            WorkflowStatus.CREATED,

        currentStepIndex:
            -1,

        input,

        updatedAt:
            Date.now(),

        retries: {},

        data: {},
    };
}
