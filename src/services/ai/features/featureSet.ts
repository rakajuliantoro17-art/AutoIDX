/**
==========================================================
AURA Trade OS
AI Feature Set
Phase 31
==========================================================
*/

import type {
    Feature,
} from "./feature";

export interface FeatureSet {
    readonly id: string;
    readonly symbol: string;
    readonly timeframe?: string;
    readonly features: readonly Feature[];
    readonly createdAt: number;
    readonly metadata: Record<string, unknown>;
}

export function createFeatureSet(
    options: {
        readonly symbol: string;
        readonly timeframe?: string;
        readonly features?: readonly Feature[];
        readonly metadata?: Record<string, unknown>;
    },
): FeatureSet {
    if (!options.symbol) {
        throw new Error(
            "Feature set symbol is required",
        );
    }

    return {
        id: createFeatureSetId(),
        symbol: options.symbol,
        timeframe: options.timeframe,
        features:
            options.features ?? [],
        createdAt: Date.now(),
        metadata:
            options.metadata ?? {},
    };
}

export function featureSetToRecord(
    featureSet: FeatureSet,
): Record<string, number> {
    const result: Record<string, number> = {};

    for (const feature of featureSet.features) {
        if (
            typeof feature.value === "number" &&
            Number.isFinite(feature.value)
        ) {
            result[feature.name] =
                feature.value;
        }
    }

    return result;
}

export function getFeature(
    featureSet: FeatureSet,
    name: string,
) {
    return featureSet.features.find(
        (feature) =>
            feature.name === name,
    );
}

function createFeatureSetId(): string {
    return [
        "feature-set",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
