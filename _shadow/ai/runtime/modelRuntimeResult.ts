/**
==========================================================
AURA Trade OS
AI Model Runtime Result
Phase 31
==========================================================
*/

export interface ModelRuntimeResult {
    readonly success: boolean;

    readonly modelId: string;

    readonly modelVersion: string;

    readonly output?:
        Record<string, unknown>;

    readonly durationMs: number;

    readonly executedAt: number;

    readonly error?: string;

    readonly metadata:
        Record<string, unknown>;
}

export function isSuccessfulRuntime(
    result: ModelRuntimeResult,
): boolean {
    return result.success;
}
