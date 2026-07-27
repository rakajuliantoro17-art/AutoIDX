/**
==========================================================
AURA Trade OS
Trade Feed
Version : 0.1.1 Alpha
==========================================================
*/

import type { Trade } from "@/services/exchange";

export interface TradeFeedOptions {

    symbol: string;

    maxHistory?: number;

}

export type TradeFeedListener =

    (trades: readonly Trade[]) => void;

export class TradeFeed {

    private readonly trades: Trade[] = [];

    private readonly listeners =

        new Set<TradeFeedListener>();

    private readonly maxHistory: number;

    constructor(

        readonly options: TradeFeedOptions

    ) {

        this.maxHistory =

            options.maxHistory ?? 5000;

    }

    /**
     * Push a new trade.
     */
    push(

        trade: Trade

    ): void {

        this.trades.push(trade);

        if (

            this.trades.length >

            this.maxHistory

        ) {

            this.trades.shift();

        }

        this.notify();

    }

    /**
     * Replace trade history.
     */
    setHistory(

        trades: readonly Trade[]

    ): void {

        this.trades.length = 0;

        this.trades.push(

            ...trades.slice(

                -this.maxHistory

            )

        );

        this.notify();

    }

    /**
     * Returns all trades.
     */
    getHistory(): readonly Trade[] {

        return this.trades;

    }

    /**
     * Returns latest trade.
     */
    latest(): Trade | undefined {

        return this.trades.at(-1);

    }

    /**
     * Clears history.
     */
    clear(): void {

        this.trades.length = 0;

        this.notify();

    }

    /**
     * Subscribe listener.
     */
    subscribe(

        listener: TradeFeedListener

    ): void {

        this.listeners.add(listener);

    }

    /**
     * Remove listener.
     */
    unsubscribe(

        listener: TradeFeedListener

    ): void {

        this.listeners.delete(listener);

    }

    /**
     * Notify subscribers.
     */
    private notify(): void {

        const snapshot =

            [...this.trades];

        this.listeners.forEach(

            listener =>

                listener(snapshot)

        );

    }

}
