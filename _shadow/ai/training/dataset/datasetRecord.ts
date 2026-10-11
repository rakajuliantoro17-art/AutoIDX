/**
==========================================================
AURA Trade OS
AI Training Dataset Record
Phase 33
==========================================================
*/

import type {
    DatasetValue,
} from "./datasetSchema";

export type DatasetFeatures =
    Record<string, DatasetValue>;

export interface DatasetRecord {
    readonly id: string;
    readonly features: DatasetFeatures;
    readonly target?: DatasetValue;
    readonly timestamp?: number;
    readonly weight: number;
    readonly metadata:
        Record<string, unknown>;
}

export function createDatasetRecord(
    options: {
        readonly features: DatasetFeatures;
        readonly target?: DatasetValue;
        readonly timestamp?: number;
        readonly weight?: number;
        readonly metadata?: Record<string, unknown>;
    },
): DatasetRecord {
    return {
        id: createRecordId(),
        features: {
            ...options.features,
        },
        target: options.target,
        timestamp:
            options.timestamp,
        weight: options.weight ?? 1,
        metadata:
            options.metadata ?? {},
    };
}

function createRecordId(): string {
    return [
        "dataset-record",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
