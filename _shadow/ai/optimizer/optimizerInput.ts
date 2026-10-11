/**
==========================================================
AURA Trade OS
Optimizer Input
Phase 30
==========================================================
*/

export interface ParameterBounds {
    readonly min: number;
    readonly max: number;
}

export interface OptimizerInput {
    readonly symbol: string;

    readonly parameters:
        Record<string, number>;

    readonly bounds?:
        Record<
            string,
            ParameterBounds
        >;

    readonly objective?:
        "RETURN"
        | "RISK"
        | "SHARPE"
        | "PROFIT_FACTOR"
        | "CUSTOM";

    readonly target?: number;

    readonly metadata?:
        Record<string, unknown>;
}

export function createOptimizerInput(
    input: OptimizerInput,
): OptimizerInput {
    if (!input.symbol) {
        throw new Error(
            "Optimizer symbol is required",
        );
    }

    return {
        ...input,
        parameters: {
            ...input.parameters,
        },
        bounds: {
            ...input.bounds,
        },
        metadata: {
            ...input.metadata,
        },
    };
}
