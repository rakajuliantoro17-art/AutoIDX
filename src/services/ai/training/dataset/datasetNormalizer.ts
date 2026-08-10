/**
==========================================================
AURA Trade OS
AI Training Dataset Normalizer
Phase 33
==========================================================
*/

import type {
    DatasetRecord,
} from "./datasetRecord";

export interface NormalizationStatistics {
    readonly mean: number;
    readonly standardDeviation: number;
    readonly minimum: number;
    readonly maximum: number;
}

export interface NormalizationResult {
    readonly records:
        readonly DatasetRecord[];

    readonly statistics:
        Record<
            string,
            NormalizationStatistics
        >;
}

export class DatasetNormalizer {
    public fit(
        records: readonly DatasetRecord[],
    ):
        Record<
            string,
            NormalizationStatistics
        > {
        const numericFields =
            this.getNumericFields(
                records,
            );

        const statistics:
            Record<
                string,
                NormalizationStatistics
            > = {};

        for (const field of numericFields) {
            const values =
                records
                    .map(
                        (record) =>
                            record
                                .features[
                                field
                            ],
                    )
                    .filter(
                        (
                            value,
                        ): value is number =>
                            typeof value ===
                            "number",
                    );

            if (
                values.length === 0
            ) {
                continue;
            }

            const mean =
                values.reduce(
                    (
                        total,
                        value,
                    ) =>
                        total + value,
                    0,
                ) /
                values.length;

            const variance =
                values.reduce(
                    (
                        total,
                        value,
                    ) =>
                        total +
                        Math.pow(
                            value -
                                mean,
                            2,
                        ),
                    0,
                ) /
                values.length;

            statistics[field] = {
                mean,
                standardDeviation:
                    Math.sqrt(
                        variance,
                    ),
                minimum:
                    Math.min(
                        ...values,
                    ),
                maximum:
                    Math.max(
                        ...values,
                    ),
            };
        }

        return statistics;
    }

    public transform(
        records: readonly DatasetRecord[],
        statistics: Record<
            string,
            NormalizationStatistics
        >,
    ): NormalizationResult {
        const transformed =
            records.map(
                (record) => {
                    const features = {
                        ...record.features,
                    };

                    for (
                        const [
                            field,
                            stats,
                        ] of Object.entries(
                            statistics,
                        )
                    ) {
                        const value =
                            features[field];

                        if (
                            typeof value !==
                            "number"
                        ) {
                            continue;
                        }

                        const scale =
                            stats.standardDeviation ===
                            0
                                ? 1
                                : stats.standardDeviation;

                        features[field] =
                            (value -
                                stats.mean) /
                            scale;
                    }

                    return {
                        ...record,
                        features,
                    };
                },
            );

        return {
            records: transformed,
            statistics,
        };
    }

    public fitTransform(
        records: readonly DatasetRecord[],
    ): NormalizationResult {
        const statistics =
            this.fit(records);

        return this.transform(
            records,
            statistics,
        );
    }

    private getNumericFields(
        records: readonly DatasetRecord[],
    ): readonly string[] {
        const fields =
            new Set<string>();

        for (const record of records) {
            for (
                const [
                    key,
                    value,
                ] of Object.entries(
                    record.features,
                ) {
                    if (
                        typeof value ===
                        "number"
                    ) {
                        fields.add(key);
                    }
                }
        }

        return [
            ...fields,
        ];
    }
}

export const datasetNormalizer =
    new DatasetNormalizer();

export default DatasetNormalizer;
