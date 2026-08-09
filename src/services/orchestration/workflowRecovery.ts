/**
==========================================================
AURA Trade OS
Workflow Recovery
Version : 0.0.7 Alpha
==========================================================
*/

import {
    WorkflowStatus,
} from "./workflowStatus";

import type {
    WorkflowState,
} from "./workflowState";

import type {
    WorkflowPersistence,
} from "./workflowPersistence";


export interface RecoveryOptions {
    readonly maxRetries?: number;
}


export class WorkflowRecovery {

    public constructor(
        private readonly persistence:
            WorkflowPersistence,
    ) {}


    public async recover(
        workflowId: string,
        executionId: string,
    ):
        Promise<WorkflowState | undefined> {

        const state =
            await this.persistence.load(
                workflowId,
                executionId,
            );


        if (!state) {
            return undefined;
        }


        if (
            state.status ===
            WorkflowStatus.COMPLETED
        ) {
            return state;
        }


        return {
            ...state,

            status:
                WorkflowStatus.RECOVERING,

            updatedAt:
                Date.now(),
        };
    }


    public async save(
        state: WorkflowState,
    ): Promise<void> {

        await this.persistence.save(
            state,
        );
    }


    public async clear(
        workflowId: string,
        executionId: string,
    ): Promise<void> {

        await this.persistence.remove(
            workflowId,
            executionId,
        );
    }
}


export default WorkflowRecovery;
