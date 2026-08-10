/**
==========================================================
AURA Trade OS
AI Feature
Phase 31
==========================================================
*/

export type FeatureValue =
    | number
    | boolean
    | null;

export type FeatureType =
    | "NUMERIC"
    | "BOOLEAN";

export interface Feature {
    readonly name: string;
    readonly value: FeatureValue;
    readonly type: FeatureType;
    readonly source?: string;
    readonly timestamp?: number;
    readonly metadata?: Record<string, unknown>;
}

export function createFeature(
    name: string,
    value: FeatureValue,
    options?: {
        readonly type?: FeatureType;
        readonly source?: string;
        readonly timestamp?: number;
        readonly metadata?: Record<string, unknown>;
    },
): Feature {
    if (!name.trim()) {
        throw new Error(
            "Feature name is required",
        );
    }

    const type =
        options?.type ??
        (
            typeof value === "boolean"
                ? "BOOLEAN"
                : "NUMERIC"
        );

    return {
        name,
        value,
        type,
        source: options?.source,
        timestamp:
            options?.timestamp ??
            Date.now(),
        metadata: options?.metadata,
    };
}

export function isNumericFeature(
    feature: Feature,
): boolean {
    return (
        feature.type === "NUMERIC" &&
        typeof feature.value === "number" &&
        Number.isFinite(feature.value)
    );
}
