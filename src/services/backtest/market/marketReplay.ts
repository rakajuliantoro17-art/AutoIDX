/**
==========================================================
AURA Trade OS
Market Replay
Phase 34
==========================================================
*/

import type {
    HistoricalCandle,
} from "./historicalCandle";

export interface MarketReplayState {
    readonly index: number;
    readonly candle:
        | HistoricalCandle
        | undefined;
    readonly completed: boolean;
}

export class MarketReplay {
    private readonly candles:
        readonly HistoricalCandle[];

    private index = -1;

    constructor(
        candles: readonly HistoricalCandle[],
    ) {
        this.candles = [
            ...candles,
        ];
    }

    public reset(): void {
        this.index = -1;
    }

    public hasNext(): boolean {
        return (
            this.index + 1 <
            this.candles.length
        );
    }

    public next():
        | HistoricalCandle
        | undefined {
        if (!this.hasNext()) {
            return undefined;
        }

        this.index += 1;

        return this.candles[
            this.index
        ];
    }

    public current():
        | HistoricalCandle
        | undefined {
        if (
            this.index < 0 ||
            this.index >=
                this.candles.length
        ) {
            return undefined;
        }

        return this.candles[
            this.index
        ];
    }

    public state(): MarketReplayState {
        return {
            index: this.index,
            candle: this.current(),
            completed:
                !this.hasNext(),
        };
    }

    public getIndex(): number {
        return this.index;
    }

    public size(): number {
        return this.candles.length;
    }
}
