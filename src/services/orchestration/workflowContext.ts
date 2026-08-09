/**
==========================================================
AURA Trade OS
Workflow Context
Version : 0.0.7 Alpha
==========================================================
*/

export interface WorkflowContext {
    readonly workflowId: string;

    readonly executionId: string;

    readonly parentWorkflowId?: string;

    readonly correlationId?: string;

    readonly causationId?: string;

    readonly startedAt: number;

    readonly data:
        Record<string, unknown>;

    readonly metadata:
        Record<string, unknown>;
}


export function createWorkflowContext(
    workflowId: string,
    options: {
        readonly executionId?: string;
        readonly parentWorkflowId?: string;
        readonly correlationId?: string;
        readonly causationId?: string;
        readonly data?: Record<string, unknown>;
        readonly metadata?: Record<string, unknown>;
    } = {},
): WorkflowContext {

    return {
        workflowId,

        executionId:
            options.executionId ??
            createExecutionId(),

        parentWorkflowId:
            options.parentWorkflowId,

        correlationId:
            options.correlationId,

        causationId:
            options.causationId,

        startedAt:
            Date.now(),

        data:
            options.data ??
            {},

        metadata:
            options.metadata ??
            {},
    };
}


export function createExecutionId(): string {
    return [
        "exec",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}
