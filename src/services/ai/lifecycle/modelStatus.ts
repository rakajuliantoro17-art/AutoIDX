/**
==========================================================
AURA Trade OS
AI Model Status
Phase 32
==========================================================
*/

export type ModelStatus =
    | "DRAFT"
    | "TRAINING"
    | "EVALUATING"
    | "READY"
    | "ACTIVE"
    | "PAUSED"
    | "DEPRECATED"
    | "FAILED"
    | "ARCHIVED";

export function isUsableModelStatus(
    status: ModelStatus,
): boolean {
    return (
        status === "READY" ||
        status === "ACTIVE"
    );
}

export function canTransitionModelStatus(
    from: ModelStatus,
    to: ModelStatus,
): boolean {
    const transitions:
        Record<
            ModelStatus,
            readonly ModelStatus[]
        > = {
        DRAFT: [
            "TRAINING",
            "FAILED",
            "ARCHIVED",
        ],

        TRAINING: [
            "EVALUATING",
            "FAILED",
        ],

        EVALUATING: [
            "READY",
            "FAILED",
        ],

        READY: [
            "ACTIVE",
            "DEPRECATED",
            "ARCHIVED",
        ],

        ACTIVE: [
            "PAUSED",
            "DEPRECATED",
        ],

        PAUSED: [
            "ACTIVE",
            "DEPRECATED",
        ],

        DEPRECATED: [
            "ARCHIVED",
        ],

        FAILED: [
            "DRAFT",
            "ARCHIVED",
        ],

        ARCHIVED: [],
    };

    return transitions[from].includes(to);
}
