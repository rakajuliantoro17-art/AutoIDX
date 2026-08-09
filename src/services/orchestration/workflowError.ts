/**
==========================================================
AURA Trade OS
Workflow Error
Version : 0.0.7 Alpha
==========================================================
*/

export enum WorkflowErrorCode {
    UNKNOWN = "WORKFLOW_UNKNOWN",
    INVALID_DEFINITION = "WORKFLOW_INVALID_DEFINITION",
    STEP_FAILED = "WORKFLOW_STEP_FAILED",
    STEP_TIMEOUT = "WORKFLOW_STEP_TIMEOUT",
    STEP_NOT_FOUND = "WORKFLOW_STEP_NOT_FOUND",
    WORKFLOW_NOT_FOUND = "WORKFLOW_NOT_FOUND",
    ALREADY_RUNNING = "WORKFLOW_ALREADY_RUNNING",
    NOT_RUNNING = "WORKFLOW_NOT_RUNNING",
    CANCELLED = "WORKFLOW_CANCELLED",
    RECOVERY_FAILED = "WORKFLOW_RECOVERY_FAILED",
}


export class WorkflowError
    extends Error {

    public readonly code:
        WorkflowErrorCode;

    public readonly workflowId?:
        string;

    public readonly stepId?:
        string;

    public readonly cause?:
        unknown;

    public constructor(
        message: string,

        options: {
            readonly code?: WorkflowErrorCode;
            readonly workflowId?: string;
            readonly stepId?: string;
            readonly cause?: unknown;
        } = {},
    ) {

        super(message);

        this.name =
            "WorkflowError";

        this.code =
            options.code ??
            WorkflowErrorCode.UNKNOWN;

        this.workflowId =
            options.workflowId;

        this.stepId =
            options.stepId;

        this.cause =
            options.cause;
    }
}


export default WorkflowError;
