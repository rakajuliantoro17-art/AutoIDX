/**
==========================================================
AURA Trade OS
Optimizer Output
Phase 30
==========================================================
*/

export interface OptimizerOutput {
    readonly modelId: string;

    readonly modelVersion: string;

    readonly parameters:
        Record<string, number>;

    readonly score: number;

    readonly iterations: number;

    readonly optimizedAt: number;

    readonly metadata:
        Record<string, unknown>;
}

export function getOptimizedParameter(
    output: OptimizerOutput,
    key: string,
): number | undefined {
    return output.parameters[
        key
    ];
}
