/**
==========================================================
AURA Trade OS
AI Feature Pipeline
Phase 33
==========================================================
*/

import type {
    DatasetRecord,
} from "../dataset/datasetRecord";

export interface FeatureVector {
    readonly values:
        readonly number[];

    readonly names:
        readonly string[];
}

export class FeaturePipeline {
    public extract(
        records: readonly DatasetRecord[],
        featureNames: readonly string[],
    ): readonly FeatureVector[] {
        return records.map(
            (record) => ({
                names: [
                    ...featureNames,
                ],

                values:
                    featureNames.map(
                        (name) => {
                            const value =
                                record
                                    .features[
                                    name
                                ];

                            if (
                                typeof value !==
                                "number"
                            ) {
                                throw new Error(
                                    `Feature '${name}' must be numeric`,
                                );
                            }

                            return value;
                        },
                    ),
            }),
        );
    }

    public targets(
        records: readonly DatasetRecord[],
    ): readonly unknown[] {
        return records.map(
            (record) =>
                record.target,
        );
    }
}

export const featurePipeline =
    new FeaturePipeline();

export default FeaturePipeline;
