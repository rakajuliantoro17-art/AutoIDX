/**
==========================================================
AURA Trade OS
Orchestration Engine
Version : 0.0.7 Alpha
==========================================================
*/

import {
    WorkflowManager,
} from "./workflowManager";

import {
    WorkflowMiddlewareChain,
} from "./workflowMiddleware";

import {
    createOrchestrationContext,
} from "./orchestrationContext";

import {
    createOrchestrationFailure,
    createOrchestrationSuccess,
} from "./orchestrationResult";

import type {
    WorkflowDefinition,
} from "./workflowDefinition";

import type {
    OrchestrationContext,
} from "./orchestrationContext";

import type {
    OrchestrationResult,
} from "./orchestrationResult";


export class OrchestrationEngine {

    public readonly workflows:
        WorkflowManager;

    public readonly middleware:
        WorkflowMiddlewareChain;


    private started =
        false;


    public constructor(
        workflowManager:
            WorkflowManager =
            new WorkflowManager(),
    ) {

        this.workflows =
            workflowManager;

        this.middleware =
            new WorkflowMiddlewareChain();
    }


    public start(): void {
        this.started = true;
    }


    public stop(): void {
        this.started = false;
    }


    public isStarted(): boolean {
        return this.started;
    }


    public registerWorkflow(
        definition:
            WorkflowDefinition,
    ): void {

        this.workflows.register(
            definition,
        );
    }


    public async execute<
        TInput = unknown,
    >(
        workflowId: string,
        input?: TInput,
        options: {
            readonly signal?: AbortSignal;
            readonly context?: Partial<
                OrchestrationContext
            >;
        } = {},
    ):
        Promise<OrchestrationResult> {

        if (!this.started) {
            this.start();
        }


        const context =
            createOrchestrationContext(
                {
                    ...options.context,
                },
            );


        const startedAt =
            Date.now();


        try {

            const workflowResult =
                await this.workflows.execute(
                    workflowId,
                    input,
                    {
                        signal:
                            options.signal,
                    },
                );


            if (
                !workflowResult.success
            ) {

                return createOrchestrationFailure(
                    context.orchestrationId,

                    workflowResult.error,

                    {
                        workflowId,

                        executionId:
                            workflowResult.executionId,

                        workflowResult,

                        durationMs:
                            Date.now() -
                            startedAt,
                    },
                );
            }


            return createOrchestrationSuccess(
                context.orchestrationId,
                {
                    workflowId,

                    executionId:
                        workflowResult.executionId,

                    data:
                        workflowResult.data,

                    workflowResult,

                    durationMs:
                        Date.now() -
                        startedAt,
                },
            );

        } catch (error) {

            return createOrchestrationFailure(
                context.orchestrationId,
                error,
                {
                    workflowId,

                    durationMs:
                        Date.now() -
                        startedAt,
                },
            );
        }
    }


    public async executeMany(
        workflows:
            readonly {
                readonly workflowId: string;
                readonly input?: unknown;
            }[],
    ):
        Promise<
            readonly OrchestrationResult[]
        > {

        const results:
            OrchestrationResult[] = [];


        for (
            const item
            of workflows
        ) {

            results.push(
                await this.execute(
                    item.workflowId,
                    item.input,
                ),
            );
        }


        return results;
    }


    public clear(): void {
        this.workflows.clear();
    }
}


export const orchestrationEngine =
    new OrchestrationEngine();


export default OrchestrationEngine;
