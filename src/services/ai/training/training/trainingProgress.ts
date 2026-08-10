/**
==========================================================
AURA Trade OS
AI Training Progress
Phase 33
==========================================================
*/

export type TrainingStage =
    | "INITIALIZING"
    | "PREPROCESSING"
    | "TRAINING"
    | "VALIDATING"
    | "TESTING"
    | "FINALIZING"
    | "COMPLETED"
    | "FAILED";

export interface TrainingProgress {
    readonly jobId: string;
    readonly stage: TrainingStage;
    readonly progress: number;
    readonly message?: string;
    readonly epoch?: number;
    readonly totalEpochs?: number;
    readonly updatedAt: number;
}

export function createTrainingProgress(
    jobId: string,
    stage: TrainingStage,
    progress: number,
    options?: {
        readonly message?: string;
        readonly epoch?: number;
        readonly totalEpochs?: number;
    },
): TrainingProgress {
    return {
        jobId,
        stage,
        progress: clamp(
            progress,
            0,
            100,
        ),
        message:
            options?.message,
        epoch: options?.epoch,
        totalEpochs:
            options?.totalEpochs,
        updatedAt: Date.now(),
    };
}

function clamp(
    value: number,
    min: number,
    max: number,
): number {
    return Math.min(
        max,
        Math.max(min, value),
    );
}
