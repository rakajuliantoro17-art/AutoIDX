/**
==========================================================
AURA Trade OS
Workflow Persistence
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    WorkflowState,
} from "./workflowState";


export interface WorkflowPersistence {

    save(
        state: WorkflowState,
    ):
        void |
        Promise<void>;

    load(
        workflowId: string,
        executionId?: string,
    ):
        WorkflowState |
        undefined |
        Promise<
            WorkflowState |
            undefined
        >;

    remove(
        workflowId: string,
        executionId?: string,
    ):
        void |
        Promise<void>;
}


export class MemoryWorkflowPersistence
    implements WorkflowPersistence {

    private readonly states:
        Map<string, WorkflowState> =
        new Map();


    public save(
        state: WorkflowState,
    ): void {

        this.states.set(
            this.key(
                state.workflowId,
                state.executionId,
            ),
            structuredCloneSafe(
                state,
            ),
        );
    }


    public load(
        workflowId: string,
        executionId?: string,
    ):
        WorkflowState |
        undefined {

        const key =
            this.key(
                workflowId,
                executionId,
            );

        const state =
            this.states.get(key);

        return state
            ? structuredCloneSafe(state)
            : undefined;
    }


    public remove(
        workflowId: string,
        executionId?: string,
    ): void {

        this.states.delete(
            this.key(
                workflowId,
                executionId,
            ),
        );
    }


    public clear(): void {
        this.states.clear();
    }


    private key(
        workflowId: string,
        executionId?: string,
    ): string {

        return [
            workflowId,
            executionId ?? "*",
        ].join(":");
    }
}


function structuredCloneSafe<
    T,
>(
    value: T,
): T {

    if (
        typeof structuredClone ===
        "function"
    ) {
        return structuredClone(
            value,
        );
    }

    return JSON.parse(
        JSON.stringify(value),
    ) as T;
}


export default MemoryWorkflowPersistence;
