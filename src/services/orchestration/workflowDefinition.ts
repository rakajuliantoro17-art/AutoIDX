/**
==========================================================
AURA Trade OS
Workflow Definition
Version : 0.0.7 Alpha
==========================================================
*/

import {
    WorkflowType,
} from "./workflowType";

import type {
    WorkflowStep,
} from "./workflowStep";


export interface WorkflowDefinition<
    TInput = unknown,
> {
    readonly id: string;

    readonly name: string;

    readonly version?: string;

    readonly type:
        WorkflowType;

    readonly description?: string;

    readonly steps:
        readonly WorkflowStep[];

    readonly initialInput?: TInput;

    readonly timeoutMs?: number;

    readonly metadata?:
        Record<string, unknown>;
}


export function validateWorkflowDefinition(
    definition:
        WorkflowDefinition,
): void {

    if (!definition.id) {
        throw new Error(
            "Workflow definition requires an id.",
        );
    }

    if (!definition.name) {
        throw new Error(
            "Workflow definition requires a name.",
        );
    }

    if (
        !Array.isArray(
            definition.steps,
        )
    ) {
        throw new Error(
            "Workflow definition requires steps.",
        );
    }


    const ids =
        new Set<string>();


    for (
        const step
        of definition.steps
    ) {

        if (
            ids.has(step.id)
        ) {
            throw new Error(
                `Duplicate workflow step: ${step.id}`,
            );
        }

        ids.add(step.id);
    }
}
