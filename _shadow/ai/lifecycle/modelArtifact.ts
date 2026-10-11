/**
==========================================================
AURA Trade OS
AI Model Artifact
Phase 32
==========================================================
*/

export type ModelArtifactType =
    | "WEIGHTS"
    | "ONNX"
    | "JSON"
    | "BINARY"
    | "REMOTE"
    | "CUSTOM";

export interface ModelArtifact {
    readonly id: string;
    readonly modelId: string;
    readonly version: string;
    readonly type: ModelArtifactType;
    readonly uri?: string;
    readonly checksum?: string;
    readonly sizeBytes?: number;
    readonly createdAt: number;
    readonly metadata: Record<string, unknown>;
}

export function createModelArtifact(
    options: {
        readonly modelId: string;
        readonly version: string;
        readonly type: ModelArtifactType;
        readonly uri?: string;
        readonly checksum?: string;
        readonly sizeBytes?: number;
        readonly metadata?: Record<string, unknown>;
    },
): ModelArtifact {
    if (!options.modelId) {
        throw new Error(
            "Model artifact modelId is required",
        );
    }

    if (!options.version) {
        throw new Error(
            "Model artifact version is required",
        );
    }

    return {
        id: createArtifactId(),
        modelId: options.modelId,
        version: options.version,
        type: options.type,
        uri: options.uri,
        checksum: options.checksum,
        sizeBytes: options.sizeBytes,
        createdAt: Date.now(),
        metadata: options.metadata ?? {},
    };
}

function createArtifactId(): string {
    return [
        "artifact",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 9),
    ].join("-");
}
