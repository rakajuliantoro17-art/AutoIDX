/**
==========================================================
AURA Trade OS
Ticker Feed
Version : 0.1.1 Alpha
==========================================================
*/

import type { Ticker } from "@/services/exchange";

export interface TickerFeedOptions {

    symbol: string;

}

export type TickerFeedListener =

    (ticker: Readonly<Ticker>) => void;

export class TickerFeed {

    private ticker?: Ticker;

    private readonly listeners =

        new Set<TickerFeedListener>();

    constructor(

        readonly options: TickerFeedOptions

    ) {}

    /**
     * Updates latest ticker.
     */
    update(

        ticker: Ticker

    ): void {

        this.ticker = ticker;

        this.notify();

    }

    /**
     * Returns latest ticker.
     */
    get(): Readonly<Ticker> | undefined {

        return this.ticker;

    }

    /**
     * Returns whether ticker exists.
     */
    hasTicker(): boolean {

        return this.ticker !== undefined;

    }

    /**
     * Clears current ticker.
     */
    clear(): void {

        this.ticker = undefined;
    }

    /**
     * Subscribe listener.
     */
    subscribe(

        listener: TickerFeedListener

    ): void {

        this.listeners.add(listener);

    }

    /**
     * Unsubscribe listener.
     */
    unsubscribe(

        listener: TickerFeedListener

    ): void {

        this.listeners.delete(listener);

    }

    /**
     * Notify subscribers.
     */
    private notify(): void {

        if (!this.ticker) {

            return;

        }

        this.listeners.forEach(

            listener =>

                listener(

                    Object.freeze({

                        ...this.ticker,

                    })

                )

        );

    }

}
