/**
==========================================================
AURA Trade OS
AI Training Request
Phase 33
==========================================================
*/

import type {
    TrainingDataset,
} from "../dataset/datasetManager";

import type {
    TrainingConfig,
} from "./trainingConfig";

export interface TrainingRequest {
    readonly modelId: string;
    readonly version?: string;
    readonly dataset:
        TrainingDataset;
    readonly config:
        TrainingConfig;
    readonly requestedBy?: string;
    readonly metadata:
        Record<string, unknown>;
}

export function createTrainingRequest(
    options: {
        readonly modelId: string;
        readonly version?: string;
        readonly dataset: TrainingDataset;
        readonly config: TrainingConfig;
        readonly requestedBy?: string;
        readonly metadata?: Record<string, unknown>;
    },
): TrainingRequest {
    if (!options.modelId) {
        throw new Error(
            "Training modelId is required",
        );
    }

    return {
        modelId: options.modelId,
        version: options.version,
        dataset: options.dataset,
        config: options.config,
        requestedBy:
            options.requestedBy,
        metadata:
            options.metadata ?? {},
    };
}
