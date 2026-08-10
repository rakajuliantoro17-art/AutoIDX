/**
==========================================================
AURA Trade OS
AI Training Dataset Builder
Phase 33
==========================================================
*/

import type {
    DatasetRecord,
} from "./datasetRecord";

import {
    createDatasetRecord,
} from "./datasetRecord";

export class DatasetBuilder {
    private records:
        DatasetRecord[] = [];

    public add(
        record: DatasetRecord,
    ): this {
        this.records.push(record);
        return this;
    }

    public addMany(
        records: readonly DatasetRecord[],
    ): this {
        this.records.push(
            ...records,
        );

        return this;
    }

    public addRow(
        options: Parameters<
            typeof createDatasetRecord
        >[0],
    ): this {
        this.records.push(
            createDatasetRecord(
                options,
            ),
        );

        return this;
    }

    public size(): number {
        return this.records.length;
    }

    public build():
        readonly DatasetRecord[] {
        return [
            ...this.records,
        ];
    }

    public clear(): this {
        this.records = [];
        return this;
    }
}

export function createDatasetBuilder():
    DatasetBuilder {
    return new DatasetBuilder();
}
