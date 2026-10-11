/**
==========================================================
AURA Trade OS
AI Training Dataset Manager
Phase 33
==========================================================
*/

import type {
    DatasetSchema,
} from "./datasetSchema";

import type {
    DatasetRecord,
} from "./datasetRecord";

import {
    DatasetValidator,
} from "./datasetValidator";

import {
    splitDatasetChronologically,
    type DatasetSplit,
    type DatasetSplitConfig,
} from "./datasetSplit";

export interface TrainingDataset {
    readonly id: string;
    readonly schema: DatasetSchema;
    readonly records:
        readonly DatasetRecord[];
    readonly createdAt: number;
    readonly metadata:
        Record<string, unknown>;
}

export class DatasetManager {
    private readonly datasets =
        new Map<
            string,
            TrainingDataset
        >();

    private readonly validator =
        new DatasetValidator();

    public create(
        schema: DatasetSchema,
        records: readonly DatasetRecord[],
        metadata?: Record<string, unknown>,
    ): TrainingDataset {
        const validation =
            this.validator.validate(
                schema,
                records,
            );

        if (!validation.valid) {
            throw new Error(
                `Dataset validation failed with ${validation.issues.length} issue(s)`,
            );
        }

        const dataset: TrainingDataset =
            {
                id: createDatasetId(),
                schema,
                records: [
                    ...records,
                ],
                createdAt: Date.now(),
                metadata:
                    metadata ?? {},
            };

        this.datasets.set(
            dataset.id,
            dataset,
        );

        return dataset;
    }

    public get(
        id: string,
    ):
        | TrainingDataset
        | undefined {
        return this.datasets.get(id);
    }

    public split(
        dataset: TrainingDataset,
        config?: DatasetSplitConfig,
    ): DatasetSplit {
        return splitDatasetChronologically(
            dataset.records,
            config,
        );
    }

    public list():
        readonly TrainingDataset[] {
        return [
            ...this.datasets.values(),
        ];
    }

    public remove(
        id: string,
    ): boolean {
        return this.datasets.delete(id);
    }

    public clear(): void {
        this.datasets.clear();
    }
}

function createDatasetId(): string {
    return [
        "training-dataset",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}

export const datasetManager =
    new DatasetManager();

export default DatasetManager;
