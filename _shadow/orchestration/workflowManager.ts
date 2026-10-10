/**
==========================================================
AURA Trade OS
Workflow Manager
Version : 0.0.7 Alpha
==========================================================
*/

import {
    Workflow,
} from "./workflow";

import {
    WorkflowRegistry,
} from "./workflowRegistry";

import {
    WorkflowExecutor,
} from "./workflowExecutor";

import {
    WorkflowScheduler,
} from "./workflowScheduler";

import {
    WorkflowRecovery,
} from "./workflowRecovery";

import {
    MemoryWorkflowPersistence,
} from "./workflowPersistence";

import {
    createWorkflowContext,
} from "./workflowContext";

import type {
    WorkflowDefinition,
} from "./workflowDefinition";

import type {
    WorkflowResult,
} from "./workflowResult";

import type {
    WorkflowPersistence,
} from "./workflowPersistence";

import type {
    WorkflowState,
} from "./workflowState";


export class WorkflowManager {

    public readonly registry:
        WorkflowRegistry;

    public readonly executor:
        WorkflowExecutor;

    public readonly scheduler:
        WorkflowScheduler;

    public readonly persistence:
        WorkflowPersistence;

    public readonly recovery:
        WorkflowRecovery;


    private readonly states:
        Map<
            string,
            WorkflowState
        > =
        new Map();


    public constructor(
        persistence:
            WorkflowPersistence =
            new MemoryWorkflowPersistence(),
    ) {

        this.registry =
            new WorkflowRegistry();

        this.executor =
            new WorkflowExecutor();

        this.scheduler =
            new WorkflowScheduler();

        this.persistence =
            persistence;

        this.recovery =
            new WorkflowRecovery(
                persistence,
            );
    }


    public register(
        definition:
            WorkflowDefinition,
    ): void {

        this.registry.register(
            definition,
        );
    }


    public unregister(
        workflowId: string,
    ): boolean {

        return this.registry.unregister(
            workflowId,
        );
    }


    public create<
        TInput = unknown,
    >(
        workflowId: string,
        input?: TInput,
    ):
        Workflow<TInput> {

        const definition =
            this.registry.get(
                workflowId,
            ) as
                | WorkflowDefinition<TInput>
                | undefined;


        if (!definition) {
            throw new Error(
                `Workflow not found: ${workflowId}`,
            );
        }


        const context =
            createWorkflowContext(
                workflowId,
            );


        return new Workflow<TInput>({
            definition,
            context,
            input,
        });
    }


    public async execute<
        TInput = unknown,
    >(
        workflowId: string,
        input?: TInput,
        options: {
            readonly signal?: AbortSignal;
            readonly executionId?: string;
        } = {},
    ):
        Promise<WorkflowResult> {

        const definition =
            this.registry.get(
                workflowId,
            ) as
                | WorkflowDefinition<TInput>
                | undefined;


        if (!definition) {
            throw new Error(
                `Workflow not found: ${workflowId}`,
            );
        }


        const context =
            createWorkflowContext(
                workflowId,
                {
                    executionId:
                        options.executionId,
                },
            );


        const workflow =
            new Workflow<TInput>({
                definition,
                context,
                input,
            });


        const state =
            this.getOrCreateState(
                workflow,
                context.executionId,
            );


        const result =
            await this.executor.execute(
                workflow,
                context,
                state,
                {
                    signal:
                        options.signal,
                },
            );


        await this.persistence.save(
            state,
        );


        this.states.set(
            this.stateKey(
                workflow.id,
                context.executionId,
            ),
            state,
        );


        return result;
    }


    public schedule<
        TInput = unknown,
    >(
        workflowId: string,
        executeAt: number,
        input?: TInput,
    ): string {

        const workflow =
            this.create(
                workflowId,
                input,
            );


        return this.scheduler.schedule(
            workflow,
            executeAt,
        );
    }


    public getState(
        workflowId: string,
        executionId: string,
    ):
        WorkflowState |
        undefined {

        return this.states.get(
            this.stateKey(
                workflowId,
                executionId,
            ),
        );
    }


    public async recover(
        workflowId: string,
        executionId: string,
    ):
        Promise<WorkflowState | undefined> {

        const state =
            await this.recovery.recover(
                workflowId,
                executionId,
            );


        if (state) {

            this.states.set(
                this.stateKey(
                    workflowId,
                    executionId,
                ),
                state,
            );
        }


        return state;
    }


    public clear(): void {

        this.states.clear();

        this.scheduler.clear();

        this.registry.clear();
    }


    private getOrCreateState(
        workflow:
            Workflow,
        executionId:
            string,
    ):
        WorkflowState {

        const key =
            this.stateKey(
                workflow.id,
                executionId,
            );


        const existing =
            this.states.get(key);


        if (existing) {
            return existing;
        }


        const state:
            WorkflowState = {

            workflowId:
                workflow.id,

            executionId,

            status:
                workflow.status,

            currentStepIndex:
                -1,

            input:
                workflow.input,

            updatedAt:
                Date.now(),

            retries: {},

            data: {},
        };


        this.states.set(
            key,
            state,
        );


        return state;
    }


    private stateKey(
        workflowId: string,
        executionId: string,
    ): string {

        return [
            workflowId,
            executionId,
        ].join(":");
    }
}


export const workflowManager =
    new WorkflowManager();


export default WorkflowManager;
