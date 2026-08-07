/**
==========================================================
AURA Trade OS
Pipeline Executor
Version : 0.3.0 Alpha
==========================================================
Pipeline Execution Engine
==========================================================
*/

import type {

    Pipeline,

} from "./pipeline";

import type {

    PipelineContext,

    PipelineStageResult,

} from "./pipelineStage";

import type {

    PipelineResult,

} from "./pipelineResult";





/*
==========================================================
Pipeline Executor
==========================================================
*/

export class PipelineExecutor {

    /*
    ======================================================
    Execute
    ======================================================
    */

    public async execute<T>(

        pipeline: Pipeline,

        context: PipelineContext,

    ): Promise<PipelineResult<T>> {

        const startedAt =

            new Date();



        const stageResults:

            PipelineStageResult[] = [];



        let failedStages =

            0;



        try {

            for (

                const stage of

                pipeline.stages

            ) {

                const stageStarted =

                    performance.now();



                try {

                    await stage.execute(

                        context,

                    );



                    stageResults.push({

                        stage: stage.name,

                        status: "completed",

                        startedAt,

                        finishedAt:

                            new Date(),

                        duration:

                            performance.now() -

                            stageStarted,

                    });

                }

                catch {

                    failedStages++;



                    stageResults.push({

                        stage: stage.name,

                        status: "failed",

                        startedAt,

                        finishedAt:

                            new Date(),

                        duration:

                            performance.now() -

                            stageStarted,

                    });

                }

            }



            const finishedAt =

                new Date();



            return {

                status:

                    failedStages === 0

                        ? "success"

                        : "partial",

                startedAt,

                finishedAt,

                duration:

                    finishedAt.getTime()

                    -

                    startedAt.getTime(),

                totalStages:

                    stageResults.length,

                completedStages:

                    stageResults.length -

                    failedStages,

                failedStages,

                stages:

                    stageResults,

                metadata: {},

            };

        }

        catch (error) {

            const finishedAt =

                new Date();



            return {

                status: "failed",

                startedAt,

                finishedAt,

                duration:

                    finishedAt.getTime()

                    -

                    startedAt.getTime(),

                totalStages:

                    stageResults.length,

                completedStages:

                    stageResults.length -

                    failedStages,

                failedStages,

                stages:

                    stageResults,

                error:

                    error as Error,

                metadata: {},

            };

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const pipelineExecutor =

    new PipelineExecutor();
