/**
==========================================================
AURA Trade OS
Workflow Executor
Version : 0.0.7 Alpha
==========================================================
*/

import {
    WorkflowError,
    WorkflowErrorCode,
} from "./workflowError";

import {
    WorkflowStatus,
} from "./workflowStatus";

import type {
    Workflow,
} from "./workflow";

import type {
    WorkflowContext,
} from "./workflowContext";

import type {
    WorkflowResult,
} from "./workflowResult";

import type {
    WorkflowState,
} from "./workflowState";


export class WorkflowExecutor {

    public async execute(
        workflow:
            Workflow,

        context:
            WorkflowContext,

        state:
            WorkflowState,

        options: {
            readonly signal?: AbortSignal;
        } = {},
    ):
        Promise<WorkflowResult> {

        const startedAt =
            Date.now();

        workflow.markRunning();

        state.status =
            WorkflowStatus.RUNNING;

        state.startedAt =
            state.startedAt ??
            startedAt;


        let currentInput =
            state.currentStepIndex >= 0
                ? state.output
                : workflow.input;


        const steps =
            workflow.definition.steps
                .slice()
                .sort(
                    (
                        left,
                        right,
                    ) =>
                        left.order -
                        right.order,
                );


        try {

            for (
                let index =
                    Math.max(
                        0,
                        state.currentStepIndex + 1,
                    );

                index <
                steps.length;

                index += 1
            ) {

                if (
                    options.signal?.aborted
                ) {

                    workflow.markCancelled();

                    state.status =
                        WorkflowStatus.CANCELLED;

                    return {
                        success: false,
                        workflowId:
                            workflow.id,
                        executionId:
                            context.executionId,
                        status:
                            WorkflowStatus.CANCELLED,
                        error:
                            new WorkflowError(
                                "Workflow execution cancelled.",
                                {
                                    code:
                                        WorkflowErrorCode.CANCELLED,
                                    workflowId:
                                        workflow.id,
                                },
                            ),
                        durationMs:
                            Date.now() -
                            startedAt,
                        timestamp:
                            Date.now(),
                    };
                }


                const step =
                    steps[index];


                state.currentStepIndex =
                    index;

                state.currentStepId =
                    step.id;

                state.updatedAt =
                    Date.now();


                try {

                    const result =
                        await this.executeStep(
                            step,
                            currentInput,
                            context,
                        );


                    if (
                        this.isWorkflowResult(
                            result,
                        )
                    ) {

                        if (
                            !result.success
                        ) {

                            if (
                                step.optional
                            ) {
                                continue;
                            }

                            workflow.markFailed();

                            state.status =
                                WorkflowStatus.FAILED;

                            state.error =
                                result.error;

                            return {
                                ...result,
                                workflowId:
                                    workflow.id,
                                executionId:
                                    context.executionId,
                                durationMs:
                                    Date.now() -
                                    startedAt,
                            };
                        }

                        currentInput =
                            result.data;

                    } else {

                        currentInput =
                            result;
                    }


                    state.output =
                        currentInput;

                    state.updatedAt =
                        Date.now();

                } catch (error) {

                    if (
                        step.optional
                    ) {
                        continue;
                    }

                    workflow.markFailed();

                    state.status =
                        WorkflowStatus.FAILED;

                    state.error =
                        error;

                    return {
                        success: false,

                        workflowId:
                            workflow.id,

                        executionId:
                            context.executionId,

                        status:
                            WorkflowStatus.FAILED,

                        error:
                            new WorkflowError(
                                `Workflow step failed: ${step.id}`,
                                {
                                    code:
                                        WorkflowErrorCode.STEP_FAILED,
                                    workflowId:
                                        workflow.id,
                                    stepId:
                                        step.id,
                                    cause:
                                        error,
                                },
                            ),

                        stepId:
                            step.id,

                        durationMs:
                            Date.now() -
                            startedAt,

                        timestamp:
                            Date.now(),
                    };
                }
            }


            state.output =
                currentInput;

            state.status =
                WorkflowStatus.COMPLETED;

            state.completedAt =
                Date.now();

            state.updatedAt =
                Date.now();

            workflow.markCompleted();


            return {
                success: true,

                workflowId:
                    workflow.id,

                executionId:
                    context.executionId,

                status:
                    WorkflowStatus.COMPLETED,

                data:
                    currentInput,

                durationMs:
                    Date.now() -
                    startedAt,

                timestamp:
                    Date.now(),
            };

        } catch (error) {

            workflow.markFailed();

            state.status =
                WorkflowStatus.FAILED;

            state.error =
                error;

            return {
                success: false,

                workflowId:
                    workflow.id,

                executionId:
                    context.executionId,

                status:
                    WorkflowStatus.FAILED,

                error,

                durationMs:
                    Date.now() -
                    startedAt,

                timestamp:
                    Date.now(),
            };
        }
    }


    private async executeStep(
        step: any,
        input: unknown,
        context: WorkflowContext,
    ): Promise<unknown> {

        return step.handler(
            input,
            context,
        );
    }


    private isWorkflowResult(
        value: unknown,
    ): value is WorkflowResult {

        return (
            typeof value === "object" &&
            value !== null &&
            "success" in value &&
            "status" in value &&
            "timestamp" in value
        );
    }
}


export default WorkflowExecutor;
