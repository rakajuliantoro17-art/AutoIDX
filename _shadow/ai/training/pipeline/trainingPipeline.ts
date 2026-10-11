/**
==========================================================
AURA Trade OS
AI Training Pipeline
Phase 33
==========================================================
*/

import type {
    TrainingRequest,
} from "../training/trainingRequest";

import type {
    TrainingResult,
} from "../training/trainingResult";

import {
    preprocessingPipeline,
} from "./preprocessingPipeline";

import {
    featurePipeline,
} from "./featurePipeline";

export interface TrainingPipelineContext {
    readonly featureNames:
        readonly string[];
}

export class TrainingPipeline {
    public prepare(
        request: TrainingRequest,
        context: TrainingPipelineContext,
    ): {
        readonly features:
            readonly number[][];
        readonly targets:
            readonly unknown[];
    } {
        const records =
            request.dataset.records;

        const processed =
            request.config
                .normalizeFeatures
                ? preprocessingPipeline
                      .fitTransform(
                          records,
                      ).records
                : records;

        const vectors =
            featurePipeline.extract(
                processed,
                context.featureNames,
            );

        return {
            features:
                vectors.map(
                    (vector) =>
                        [
                            ...vector.values,
                        ],
                ),

            targets:
                featurePipeline.targets(
                    processed,
                ),
        };
    }

    public finalize(
        result: TrainingResult,
    ): TrainingResult {
        return {
            ...result,
            metadata: {
                ...result.metadata,
                pipeline:
                    "AURA_TRAINING_PIPELINE_V1",
            },
        };
    }
}

export const trainingPipeline =
    new TrainingPipeline();

export default TrainingPipeline;
