/**
==========================================================
AURA Trade OS
AI Model Version
Phase 32
==========================================================
*/

export interface ModelVersion {
    readonly modelId: string;
    readonly version: string;
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly createdAt: number;
    readonly releaseNotes?: string;
}

export function createModelVersion(
    modelId: string,
    version: string,
    options?: {
        readonly releaseNotes?: string;
    },
): ModelVersion {
    if (!modelId) {
        throw new Error(
            "Model ID is required",
        );
    }

    const parsed =
        parseSemanticVersion(version);

    return {
        modelId,
        version,
        major: parsed.major,
        minor: parsed.minor,
        patch: parsed.patch,
        createdAt: Date.now(),
        releaseNotes:
            options?.releaseNotes,
    };
}

export function compareModelVersions(
    left: ModelVersion,
    right: ModelVersion,
): number {
    if (left.major !== right.major) {
        return left.major - right.major;
    }

    if (left.minor !== right.minor) {
        return left.minor - right.minor;
    }

    return left.patch - right.patch;
}

export function isNewerModelVersion(
    left: ModelVersion,
    right: ModelVersion,
): boolean {
    return (
        compareModelVersions(
            left,
            right,
        ) > 0
    );
}

function parseSemanticVersion(
    version: string,
): {
    major: number;
    minor: number;
    patch: number;
} {
    const match =
        version.match(
            /^v?(\d+)\.(\d+)\.(\d+)/,
        );

    if (!match) {
        throw new Error(
            `Invalid semantic model version: ${version}`,
        );
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
    };
}
