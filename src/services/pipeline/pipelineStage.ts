/**
==========================================================
AURA Trade OS
Pipeline Stage
Version : 0.3.0 Alpha
==========================================================
Pipeline Stage Contract
==========================================================
*/





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





export interface PipelineContext {

    metadata:

        Record<string, unknown>;

}





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

