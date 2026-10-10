/**
==========================================================
AURA Trade OS
Historical Dataset
Phase 34
==========================================================
*/

import type {
    HistoricalCandle,
} from "./historicalCandle";

import {
    validateCandle,
} from "./historicalCandle";

export interface HistoricalDataset {
    readonly id: string;
    readonly symbol: string;
    readonly timeframe: string;
    readonly candles:
        readonly HistoricalCandle[];
    readonly createdAt: number;
    readonly metadata:
        Record<string, unknown>;
}

export function createHistoricalDataset(
    input: {
        readonly symbol: string;
        readonly timeframe: string;
        readonly candles:
            readonly HistoricalCandle[];
        readonly id?: string;
        readonly metadata?: Record<string, unknown>;
    },
): HistoricalDataset {
    if (!input.symbol) {
        throw new Error(
            "Historical dataset symbol is required",
        );
    }

    if (!input.timeframe) {
        throw new Error(
            "Historical dataset timeframe is required",
        );
    }

    if (input.candles.length === 0) {
        throw new Error(
            "Historical dataset cannot be empty",
        );
    }

    const candles = [
        ...input.candles,
    ].sort(
        (a, b) =>
            a.timestamp -
            b.timestamp,
    );

    for (let i = 0; i < candles.length; i++) {
        validateCandle(candles[i]);

        if (
            i > 0 &&
            candles[i].timestamp <=
                candles[i - 1].timestamp
        ) {
            throw new Error(
                "Historical candles must have strictly increasing timestamps",
            );
        }
    }

    return {
        id:
            input.id ??
            createDatasetId(),
        symbol: input.symbol,
        timeframe: input.timeframe,
        candles,
        createdAt: Date.now(),
        metadata:
            input.metadata ?? {},
    };
}

function createDatasetId(): string {
    return [
        "historical-dataset",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
