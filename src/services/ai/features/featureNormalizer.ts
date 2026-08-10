/**
==========================================================
AURA Trade OS
AI Feature Normalizer
Phase 31
==========================================================
*/

import type {
    Feature,
} from "./feature";

import type {
    FeatureSet,
} from "./featureSet";

export type NormalizationMethod =
    | "MIN_MAX"
    | "Z_SCORE"
    | "NONE";

export interface NormalizationStats {
    readonly min: number;
    readonly max: number;
    readonly mean: number;
    readonly standardDeviation: number;
}

export class FeatureNormalizer {
    public normalize(
        featureSet: FeatureSet,
        method:
            NormalizationMethod = "MIN_MAX",
        stats?: Record<
            string,
            NormalizationStats
        >,
    ): FeatureSet {
        const features =
            featureSet.features.map(
                (feature) => {
                    if (
                        typeof feature.value !==
                        "number"
                    ) {
                        return feature;
                    }

                    const featureStats =
                        stats?.[
                            feature.name
                        ];

                    const value =
                        featureStats
                            ? this.apply(
                                  feature.value,
                                  method,
                                  featureStats,
                              )
                            : feature.value;

                    return {
                        ...feature,
                        value,
                    };
                },
            );

        return {
            ...featureSet,
            features,
        };
    }

    private apply(
        value: number,
        method: NormalizationMethod,
        stats: NormalizationStats,
    ): number {
        switch (method) {
            case "MIN_MAX": {
                const range =
                    stats.max -
                    stats.min;

                if (range === 0) {
                    return 0;
                }

                return (
                    (value -
                        stats.min) /
                    range
                );
            }

            case "Z_SCORE": {
                if (
                    stats.standardDeviation ===
                    0
                ) {
                    return 0;
                }

                return (
                    (value -
                        stats.mean) /
                    stats.standardDeviation
                );
            }

            case "NONE":
            default:
                return value;
        }
    }

    public calculateStats(
        features: readonly Feature[],
    ): Record<
        string,
        NormalizationStats
    > {
        const result: Record<
            string,
            NormalizationStats
        > = {};

        for (const feature of features) {
            if (
                typeof feature.value !==
                "number"
            ) {
                continue;
            }

            result[feature.name] = {
                min: feature.value,
                max: feature.value,
                mean: feature.value,
                standardDeviation: 0,
            };
        }

        return result;
    }
}

export const featureNormalizer =
    new FeatureNormalizer();

export default FeatureNormalizer;
