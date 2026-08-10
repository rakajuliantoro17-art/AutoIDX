/**
==========================================================
AURA Trade OS
Backtest Configuration
Phase 34
==========================================================
*/

export interface BacktestConfig {
    readonly initialCapital: number;
    readonly feeRate: number;
    readonly slippageRate: number;
    readonly maxPositionSize?: number;
    readonly allowShort: boolean;
    readonly priceReference:
        | "OPEN"
        | "CLOSE";
    readonly riskFreeRate: number;
    readonly periodsPerYear: number;
    readonly metadata:
        Record<string, unknown>;
}

export function createBacktestConfig(
    options: {
        readonly initialCapital: number;
        readonly feeRate?: number;
        readonly slippageRate?: number;
        readonly maxPositionSize?: number;
        readonly allowShort?: boolean;
        readonly priceReference?: "OPEN" | "CLOSE";
        readonly riskFreeRate?: number;
        readonly periodsPerYear?: number;
        readonly metadata?: Record<string, unknown>;
    },
): BacktestConfig {
    if (
        options.initialCapital <= 0
    ) {
        throw new Error(
            "Initial capital must be greater than zero",
        );
    }

    const feeRate =
        options.feeRate ?? 0;

    const slippageRate =
        options.slippageRate ?? 0;

    if (
        feeRate < 0 ||
        slippageRate < 0
    ) {
        throw new Error(
            "Fee and slippage rates cannot be negative",
        );
    }

    return {
        initialCapital:
            options.initialCapital,
        feeRate,
        slippageRate,
        maxPositionSize:
            options.maxPositionSize,
        allowShort:
            options.allowShort ?? false,
        priceReference:
            options.priceReference ??
            "CLOSE",
        riskFreeRate:
            options.riskFreeRate ?? 0,
        periodsPerYear:
            options.periodsPerYear ??
            365,
        metadata:
            options.metadata ?? {},
    };
}
