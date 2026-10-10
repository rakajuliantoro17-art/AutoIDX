/**
==========================================================
AURA Trade OS
Workflow Registry
Version : 0.0.7 Alpha
==========================================================
*/

import {
    validateWorkflowDefinition,
} from "./workflowDefinition";

import type {
    WorkflowDefinition,
} from "./workflowDefinition";


export class WorkflowRegistry {

    private readonly definitions:
        Map<
            string,
            WorkflowDefinition
        > =
        new Map();


    public register(
        definition:
            WorkflowDefinition,
    ): void {

        validateWorkflowDefinition(
            definition,
        );

        this.definitions.set(
            definition.id,
            definition,
        );
    }


    public unregister(
        workflowId: string,
    ): boolean {

        return this.definitions.delete(
            workflowId,
        );
    }


    public get(
        workflowId: string,
    ):
        WorkflowDefinition |
        undefined {

        return this.definitions.get(
            workflowId,
        );
    }


    public has(
        workflowId: string,
    ): boolean {

        return this.definitions.has(
            workflowId,
        );
    }


    public clear(): void {
        this.definitions.clear();
    }


    public size(): number {
        return this.definitions.size;
    }


    public list():
        readonly WorkflowDefinition[] {

        return [
            ...this.definitions.values(),
        ];
    }
}


export default WorkflowRegistry;
