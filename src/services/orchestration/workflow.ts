/**
==========================================================
AURA Trade OS
Workflow
Version : 0.0.7 Alpha
==========================================================
*/

import {
    WorkflowStatus,
} from "./workflowStatus";

import {
    WorkflowType,
} from "./workflowType";

import type {
    WorkflowDefinition,
} from "./workflowDefinition";

import type {
    WorkflowContext,
} from "./workflowContext";


export interface WorkflowOptions<
    TInput = unknown,
> {
    readonly id?: string;

    readonly definition:
        WorkflowDefinition<TInput>;

    readonly context?:
        WorkflowContext;

    readonly status?:
        WorkflowStatus;

    readonly input?:
        TInput;

    readonly createdAt?:
        number;
}


export class Workflow<
    TInput = unknown,
> {

    public readonly id: string;

    public readonly definition:
        WorkflowDefinition<TInput>;

    public readonly type:
        WorkflowType;

    public readonly context?:
        WorkflowContext;

    public readonly input?:
        TInput;

    public readonly createdAt:
        number;

    public status:
        WorkflowStatus;


    public constructor(
        options:
            WorkflowOptions<TInput>,
    ) {

        this.id =
            options.id ??
            options.definition.id;

        this.definition =
            options.definition;

        this.type =
            options.definition.type;

        this.context =
            options.context;

        this.input =
            options.input ??
            options.definition.initialInput;

        this.status =
            options.status ??
            WorkflowStatus.CREATED;

        this.createdAt =
            options.createdAt ??
            Date.now();
    }


    public markReady(): this {
        this.status =
            WorkflowStatus.READY;
        return this;
    }


    public markRunning(): this {
        this.status =
            WorkflowStatus.RUNNING;
        return this;
    }


    public markWaiting(): this {
        this.status =
            WorkflowStatus.WAITING;
        return this;
    }


    public markPaused(): this {
        this.status =
            WorkflowStatus.PAUSED;
        return this;
    }


    public markCompleted(): this {
        this.status =
            WorkflowStatus.COMPLETED;
        return this;
    }


    public markFailed(): this {
        this.status =
            WorkflowStatus.FAILED;
        return this;
    }


    public markCancelled(): this {
        this.status =
            WorkflowStatus.CANCELLED;
        return this;
    }


    public markRecovering(): this {
        this.status =
            WorkflowStatus.RECOVERING;
        return this;
    }


    public isTerminal(): boolean {
        return (
            this.status ===
                WorkflowStatus.COMPLETED ||
            this.status ===
                WorkflowStatus.FAILED ||
            this.status ===
                WorkflowStatus.CANCELLED ||
            this.status ===
                WorkflowStatus.REJECTED
        );
    }


    public isActive(): boolean {
        return (
            this.status ===
                WorkflowStatus.RUNNING ||
            this.status ===
                WorkflowStatus.WAITING ||
            this.status ===
                WorkflowStatus.RECOVERING
        );
    }
}


export default Workflow;
