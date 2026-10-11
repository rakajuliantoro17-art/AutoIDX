/**
==========================================================
AURA Trade OS
AI Training Dataset Schema
Phase 33
==========================================================
*/

export type DatasetValue =
    | number
    | string
    | boolean
    | null;

export type DatasetFeatureType =
    | "NUMERIC"
    | "CATEGORICAL"
    | "BOOLEAN"
    | "TEXT"
    | "TIMESTAMP";

export interface DatasetFeatureDefinition {
    readonly name: string;
    readonly type: DatasetFeatureType;
    readonly required: boolean;
    readonly nullable: boolean;
    readonly description?: string;
}

export interface DatasetSchema {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly features:
        readonly DatasetFeatureDefinition[];
    readonly target?: DatasetFeatureDefinition;
    readonly timestampField?: string;
    readonly metadata:
        Record<string, unknown>;
}

export function createDatasetSchema(
    options: {
        readonly name: string;
        readonly version?: string;
        readonly features: readonly DatasetFeatureDefinition[];
        readonly target?: DatasetFeatureDefinition;
        readonly timestampField?: string;
        readonly metadata?: Record<string, unknown>;
    },
): DatasetSchema {
    if (!options.name) {
        throw new Error(
            "Dataset schema name is required",
        );
    }

    if (
        options.features.length === 0
    ) {
        throw new Error(
            "Dataset schema must contain at least one feature",
        );
    }

    return {
        id: createSchemaId(),
        name: options.name,
        version:
            options.version ?? "1.0.0",
        features: [
            ...options.features,
        ],
        target: options.target,
        timestampField:
            options.timestampField,
        metadata:
            options.metadata ?? {},
    };
}

export function getFeature(
    schema: DatasetSchema,
    name: string,
):
    | DatasetFeatureDefinition
    | undefined {
    return schema.features.find(
        (feature) =>
            feature.name === name,
    );
}

function createSchemaId(): string {
    return [
        "dataset-schema",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
