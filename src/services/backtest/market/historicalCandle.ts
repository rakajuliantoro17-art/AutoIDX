/**
==========================================================
AURA Trade OS
Backtesting Engine
Historical Candle
Phase 34
==========================================================
*/

export interface HistoricalCandle {
    readonly timestamp: number;
    readonly open: number;
    readonly high: number;
    readonly low: number;
    readonly close: number;
    readonly volume: number;
}

export function createHistoricalCandle(
    input: HistoricalCandle,
): HistoricalCandle {
    validateCandle(input);

    return {
        timestamp: input.timestamp,
        open: input.open,
        high: input.high,
        low: input.low,
        close: input.close,
        volume: input.volume,
    };
}

export function validateCandle(
    candle: HistoricalCandle,
): void {
    const values = [
        candle.open,
        candle.high,
        candle.low,
        candle.close,
        candle.volume,
    ];

    if (
        !Number.isFinite(
            candle.timestamp,
        ) ||
        candle.timestamp < 0
    ) {
        throw new Error(
            "Invalid candle timestamp",
        );
    }

    if (
        values.some(
            (value) =>
                !Number.isFinite(value),
        )
    ) {
        throw new Error(
            "Historical candle contains invalid numeric values",
        );
    }

    if (
        candle.open <= 0 ||
        candle.high <= 0 ||
        candle.low <= 0 ||
        candle.close <= 0
    ) {
        throw new Error(
            "OHLC prices must be greater than zero",
        );
    }

    if (
        candle.high <
        Math.max(
            candle.open,
            candle.close,
        )
    ) {
        throw new Error(
            "Candle high is invalid",
        );
    }

    if (
        candle.low >
        Math.min(
            candle.open,
            candle.close,
        )
    ) {
        throw new Error(
            "Candle low is invalid",
        );
    }

    if (candle.volume < 0) {
        throw new Error(
            "Candle volume cannot be negative",
        );
    }
}
