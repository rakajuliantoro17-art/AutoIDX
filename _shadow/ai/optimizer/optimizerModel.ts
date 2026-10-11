/**
==========================================================
AURA Trade OS
Optimizer Model
Phase 30
==========================================================
*/

import type {
    OptimizerInput,
} from "./optimizerInput";

import type {
    OptimizerOutput,
} from "./optimizerOutput";

export interface OptimizerModel {
    readonly id: string;

    readonly version: string;

    optimize(
        input: OptimizerInput,
    ): OptimizerOutput;
}

export class BasicOptimizerModel
    implements OptimizerModel {
    public readonly id =
        "basic-optimizer";

    public readonly version =
        "1.0.0";

    public optimize(
        input: OptimizerInput,
    ): OptimizerOutput {
        const parameters =
            Object.entries(
                input.parameters,
            ).reduce(
                (
                    result,
                    [
                        key,
                        value,
                    ],
                ) => {
                    result[key] =
                        clamp(
                            value,
                            input.bounds?.[
                                key
                            ],
                        );

                    return result;
                },
                {} as Record<
                    string,
                    number
                >,
            );

        return {
            modelId: this.id,
            modelVersion:
                this.version,
            parameters,
            score:
                calculateParameterScore(
                    parameters,
                ),
            iterations: 1,
            optimizedAt:
                Date.now(),
            metadata: {
                symbol:
                    input.symbol,
            },
        };
    }
}

function clamp(
    value: number,
    bound?: {
        readonly min: number;
        readonly max: number;
    },
): number {
    if (!bound) {
        return value;
    }

    return Math.max(
        bound.min,
        Math.min(
            bound.max,
            value,
        ),
    );
}

function calculateParameterScore(
    parameters: Record<
        string,
        number
    >,
): number {
    const values =
        Object.values(parameters);

    if (
        values.length === 0
    ) {
        return 0;
    }

    return (
        values.reduce(
            (
                total,
                value,
            ) =>
                total + value,
            0,
        ) / values.length
    );
}

export default BasicOptimizerModel;
