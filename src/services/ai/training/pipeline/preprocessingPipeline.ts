/**
==========================================================
AURA Trade OS
AI Preprocessing Pipeline
Phase 33
==========================================================
*/

import {
    DatasetNormalizer,
    type NormalizationStatistics,
} from "../dataset/datasetNormalizer";

import type {
    DatasetRecord,
} from "../dataset/datasetRecord";

export interface PreprocessingResult {
    readonly records:
        readonly DatasetRecord[];

    readonly statistics:
        Record<
            string,
            NormalizationStatistics
        >;
}

export class PreprocessingPipeline {
    private readonly normalizer =
        new DatasetNormalizer();

    public fitTransform(
        records: readonly DatasetRecord[],
    ): PreprocessingResult {
        return this.normalizer.fitTransform(
            records,
        );
    }

    public transform(
        records: readonly DatasetRecord[],
        statistics: Record<
            string,
            NormalizationStatistics
        >,
    ): PreprocessingResult {
        return this.normalizer.transform(
            records,
            statistics,
        );
    }
}

export const preprocessingPipeline =
    new PreprocessingPipeline();

export default PreprocessingPipeline;
