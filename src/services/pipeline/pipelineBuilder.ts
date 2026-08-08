/**
==========================================================
AURA Trade OS
Pipeline Stage
Version : 0.3.1 Alpha
==========================================================
Pipeline Stage Contract
==========================================================
*/

import type { PipelineContext } from "./pipelineContext";

/*
==========================================================
Types
==========================================================
*/
export type PipelineStageStatus =
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "skipped";

export interface PipelineStage {
    readonly name: string;
    execute(
        context: PipelineContext,
    ): Promise<void>;
}

export interface PipelineStageResult {
    stage: string;
    status: PipelineStageStatus;
    startedAt: Date;
    finishedAt: Date;
    duration: number;
}
