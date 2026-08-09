/**
==========================================================
AURA Trade OS
Execution Metadata
Version : 0.0.7 Alpha
==========================================================
*/

export interface ExecutionMetadata {
    readonly strategyId?: string;

    readonly symbol?: string;

    readonly timeframe?: string;

    readonly exchange?: string;

    readonly environment?:
        "LIVE" |
        "PAPER" |
        "BACKTEST";

    readonly attempt: number;

    readonly tags:
        readonly string[];

    readonly values:
        Record<string, unknown>;
}

export function createExecutionMetadata(
    options: {
        readonly strategyId?: string;
        readonly symbol?: string;
        readonly timeframe?: string;
        readonly exchange?: string;
        readonly environment?:
            "LIVE" |
            "PAPER" |
            "BACKTEST";
        readonly attempt?: number;
        readonly tags?: readonly string[];
        readonly values?: Record<string, unknown>;
    } = {},
): ExecutionMetadata {
    return {
        strategyId:
            options.strategyId,

        symbol:
            options.symbol,

        timeframe:
            options.timeframe,

        exchange:
            options.exchange,

        environment:
            options.environment,

        attempt:
            options.attempt ?? 1,

        tags:
            options.tags ?? [],

        values:
            options.values ?? {},
    };
}
