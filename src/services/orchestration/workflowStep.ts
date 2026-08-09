/**
==========================================================
AURA Trade OS
Workflow Step
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    WorkflowContext,
} from "./workflowContext";

import type {
    WorkflowResult,
} from "./workflowResult";


export type WorkflowStepHandler<
    TInput = unknown,
    TOutput = unknown,
> = (
    input: TInput,
    context: WorkflowContext,
) =>
    TOutput |
    WorkflowResult<TOutput> |
    Promise<TOutput | WorkflowResult<TOutput>>;


export interface WorkflowStep<
    TInput = unknown,
    TOutput = unknown,
> {
    readonly id: string;

    readonly name?: string;

    readonly order: number;

    readonly handler:
        WorkflowStepHandler<
            TInput,
            TOutput
        >;

    readonly optional?: boolean;

    readonly retryable?: boolean;

    readonly maxRetries?: number;

    readonly timeoutMs?: number;

    readonly metadata?:
        Record<string, unknown>;
}


export function createWorkflowStepId(): string {
    return [
        "step",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 9),
    ].join("-");
}


export function createWorkflowStep<
    TInput = unknown,
    TOutput = unknown,
>(
    options: Omit<
        WorkflowStep<TInput, TOutput>,
        "id"
    > & {
        readonly id?: string;
    },
): WorkflowStep<TInput, TOutput> {

    return {
        ...options,
        id:
            options.id ??
            createWorkflowStepId(),
    };
}
