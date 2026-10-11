/**
==========================================================
AURA Trade OS
AI Training Job
Phase 33
==========================================================
*/

import type {
    TrainingRequest,
} from "./trainingRequest";

import type {
    TrainingProgress,
} from "./trainingProgress";

export type TrainingJobStatus =
    | "QUEUED"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";

export interface TrainingJob {
    readonly id: string;
    readonly request:
        TrainingRequest;
    readonly status:
        TrainingJobStatus;
    readonly progress:
        TrainingProgress;
    readonly createdAt: number;
    readonly startedAt?: number;
    readonly completedAt?: number;
    readonly error?: string;
}

export function createTrainingJob(
    request: TrainingRequest,
): TrainingJob {
    const id = createJobId();

    return {
        id,
        request,
        status: "QUEUED",
        progress: {
            jobId: id,
            stage: "INITIALIZING",
            progress: 0,
            updatedAt: Date.now(),
        },
        createdAt: Date.now(),
    };
}

function createJobId(): string {
    return [
        "training-job",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
