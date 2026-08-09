/**
==========================================================
AURA Trade OS
Workflow Middleware
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    Workflow,
} from "./workflow";

import type {
    WorkflowContext,
} from "./workflowContext";

import type {
    WorkflowResult,
} from "./workflowResult";


export type WorkflowMiddleware = (
    workflow: Workflow,

    context: WorkflowContext,

    next: (
        workflow: Workflow,
        context: WorkflowContext,
    ) =>
        WorkflowResult |
        Promise<WorkflowResult>,
) =>
    WorkflowResult |
    Promise<WorkflowResult>;


export class WorkflowMiddlewareChain {

    private readonly items:
        WorkflowMiddleware[] = [];


    public use(
        middleware:
            WorkflowMiddleware,
    ): this {

        this.items.push(
            middleware,
        );

        return this;
    }


    public async execute(
        workflow: Workflow,

        context: WorkflowContext,

        terminal: (
            workflow: Workflow,
            context: WorkflowContext,
        ) =>
            WorkflowResult |
            Promise<WorkflowResult>,
    ):
        Promise<WorkflowResult> {

        let index = -1;


        const dispatch =
            async (
                currentWorkflow:
                    Workflow,

                currentContext:
                    WorkflowContext,
            ):
                Promise<WorkflowResult> => {

                index += 1;


                if (
                    index >=
                    this.items.length
                ) {

                    return terminal(
                        currentWorkflow,
                        currentContext,
                    );
                }


                return this.items[index](
                    currentWorkflow,
                    currentContext,
                    dispatch,
                );
            };


        return dispatch(
            workflow,
            context,
        );
    }


    public clear(): void {
        this.items.length = 0;
    }


    public size(): number {
        return this.items.length;
    }
}


export default WorkflowMiddlewareChain;
