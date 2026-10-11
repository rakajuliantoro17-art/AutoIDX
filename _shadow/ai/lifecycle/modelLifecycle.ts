/**
==========================================================
AURA Trade OS
AI Model Lifecycle
Phase 32
==========================================================
*/

import type {
    ModelArtifact,
} from "./modelArtifact";

import type {
    ModelMetadata,
} from "./modelMetadata";

import type {
    ModelVersion,
} from "./modelVersion";

import type {
    ModelStatus,
} from "./modelStatus";

export interface ModelLifecycle {
    readonly modelId: string;
    readonly version: ModelVersion;
    readonly metadata: ModelMetadata;
    readonly artifact?: ModelArtifact;
    readonly status: ModelStatus;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly activatedAt?: number;
    readonly deprecatedAt?: number;
}

export function createModelLifecycle(
    options: {
        readonly version: ModelVersion;
        readonly metadata: ModelMetadata;
        readonly artifact?: ModelArtifact;
        readonly status?: ModelStatus;
    },
): ModelLifecycle {
    const now = Date.now();

    return {
        modelId:
            options.version.modelId,
        version: options.version,
        metadata: options.metadata,
        artifact: options.artifact,
        status:
            options.status ?? "DRAFT",
        createdAt: now,
        updatedAt: now,
    };
}
