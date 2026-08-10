/**
==========================================================
AURA Trade OS
AI Training Manager
Phase 33
==========================================================
*/

import type {
    TrainingEngine,
} from "./trainingEngine";

import {
    DefaultTrainingEngine,
} from "./trainingEngine";

import type {
    TrainingRequest,
} from "./trainingRequest";

import type {
    TrainingResult,
} from "./trainingResult";

import {
    createTrainingJob,
    type TrainingJob,
} from "./trainingJob";

import type {
    TrainingProgress,
} from "./trainingProgress";

export class TrainingManager {
    private readonly engine:
        TrainingEngine;

    private readonly jobs =
        new Map<
            string,
            TrainingJob
        >();

    constructor(
        engine?: TrainingEngine,
    ) {
        this.engine =
            engine ??
            new DefaultTrainingEngine();
    }

    public createJob(
        request: TrainingRequest,
    ): TrainingJob {
        const job =
            createTrainingJob(
                request,
            );

        this.jobs.set(
            job.id,
            job,
        );

        return job;
    }

    public async train(
        request: TrainingRequest,
        onProgress?: (
            progress: TrainingProgress,
        ) => void,
    ): Promise<TrainingResult> {
        const job =
            this.createJob(
                request,
            );

        const result =
            await this.engine.train(
                request,
                {
                    reportProgress:
                        (
                            progress,
                        ) => {
                            onProgress?.({
                                ...progress,
                                jobId:
                                    job.id,
                            });
                        },
                },
            );

        return {
            ...result,
            jobId: job.id,
        };
    }

    public getJob(
        id: string,
    ):
        | TrainingJob
        | undefined {
        return this.jobs.get(id);
    }

    public listJobs():
        readonly TrainingJob[] {
        return [
            ...this.jobs.values(),
        ];
    }

    public clear(): void {
        this.jobs.clear();
    }
}

export const trainingManager =
    new TrainingManager();

export default TrainingManager;
