/**
==========================================================
AURA Trade OS
Candle Feed
Version : 0.1.1 Alpha
==========================================================
*/

import type { Candle } from "@/services/exchange";

export interface CandleFeedOptions {

    symbol: string;

    interval: string;

    maxHistory?: number;

}

export type CandleFeedListener =

    (candles: readonly Candle[]) => void;

export class CandleFeed {

    private readonly candles: Candle[] = [];

    private readonly listeners =

        new Set<CandleFeedListener>();

    private readonly maxHistory: number;

    constructor(

        readonly options: CandleFeedOptions

    ) {

        this.maxHistory =

            options.maxHistory ?? 1000;

    }

    /**
     * Pushes a new candle.
     */
    push(

        candle: Candle

    ): void {

        this.candles.push(candle);

        if (

            this.candles.length >

            this.maxHistory

        ) {

            this.candles.shift();

        }

        this.notify();

    }

    /**
     * Replaces candle history.
     */
    setHistory(

        candles: readonly Candle[]

    ): void {

        this.candles.length = 0;

        this.candles.push(

            ...candles.slice(

                -this.maxHistory

            )

        );

        this.notify();

    }

    /**
     * Returns candle history.
     */
    getHistory(): readonly Candle[] {

        return this.candles;

    }

    /**
     * Returns latest candle.
     */
    latest(): Candle | undefined {

        return this.candles.at(-1);

    }

    /**
     * Subscribe.
     */
    subscribe(

        listener: CandleFeedListener

    ): void {

        this.listeners.add(listener);

    }

    /**
     * Unsubscribe.
     */
    unsubscribe(

        listener: CandleFeedListener

    ): void {

        this.listeners.delete(listener);

    }

    /**
     * Notify listeners.
     */
    private notify(): void {

        const snapshot =

            [...this.candles];

        this.listeners.forEach(

            listener =>

                listener(snapshot)

        );

    }

}
