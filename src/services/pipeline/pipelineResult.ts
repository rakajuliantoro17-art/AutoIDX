/**
==========================================================
AURA Trade OS
Pipeline Result
Version : 0.3.0 Alpha
==========================================================
Pipeline Execution Result
==========================================================
*/

import type {

    PipelineStageResult,

} from "./pipelineStage";





/*
==========================================================
Types
==========================================================
*/

export type PipelineStatus =

    | "success"

    | "failed"

    | "partial";





export interface PipelineResult<T = unknown> {

    status: PipelineStatus;





    startedAt: Date;

    finishedAt: Date;

    duration: number;





    totalStages: number;

    completedStages: number;

    failedStages: number;





    stages:

        PipelineStageResult[];





    output?: T;





    error?: Error;





    metadata:

        Record<string, unknown>;

}

