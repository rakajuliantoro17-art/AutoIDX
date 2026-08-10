/**
==========================================================
AURA Trade OS
AI Evaluation Sample
Phase 32
==========================================================
*/

export interface EvaluationSample {
    readonly id: string;
    readonly input:
        Record<string, unknown>;
    readonly expected:
        unknown;
    readonly actual?: unknown;
    readonly weight?: number;
    readonly timestamp?: number;
    readonly metadata:
        Record<string, unknown>;
}

export function createEvaluationSample(
    options: {
        readonly input: Record<string, unknown>;
        readonly expected: unknown;
        readonly actual?: unknown;
        readonly weight?: number;
        readonly timestamp?: number;
        readonly metadata?: Record<string, unknown>;
    },
): EvaluationSample {
    return {
        id: createSampleId(),
        input: options.input,
        expected: options.expected,
        actual: options.actual,
        weight: options.weight ?? 1,
        timestamp:
            options.timestamp,
        metadata:
            options.metadata ?? {},
    };
}

function createSampleId(): string {
    return [
        "sample",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
