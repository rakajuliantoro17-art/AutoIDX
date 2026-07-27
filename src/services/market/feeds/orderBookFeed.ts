/**
==========================================================
AURA Trade OS
Order Book Feed
Version : 0.1.1 Alpha
==========================================================
*/

import type { OrderBook } from "@/services/exchange";

export interface OrderBookFeedOptions {

    symbol: string;

}

export type OrderBookFeedListener =

    (orderBook: Readonly<OrderBook>) => void;

export class OrderBookFeed {

    private orderBook?: OrderBook;

    private readonly listeners =

        new Set<OrderBookFeedListener>();

    constructor(

        readonly options: OrderBookFeedOptions

    ) {}

    /**
     * Updates latest order book.
     */
    update(

        orderBook: OrderBook

    ): void {

        this.orderBook = {

            ...orderBook,

            bids: [...orderBook.bids],

            asks: [...orderBook.asks],

        };

        this.notify();

    }

    /**
     * Returns latest order book.
     */
    get(): Readonly<OrderBook> | undefined {

        return this.orderBook;

    }

    /**
     * Returns whether feed has data.
     */
    hasOrderBook(): boolean {

        return this.orderBook !== undefined;

    }

    /**
     * Clears current snapshot.
     */
    clear(): void {

        this.orderBook = undefined;

    }

    /**
     * Subscribe listener.
     */
    subscribe(

        listener: OrderBookFeedListener

    ): void {

        this.listeners.add(listener);

    }

    /**
     * Unsubscribe listener.
     */
    unsubscribe(

        listener: OrderBookFeedListener

    ): void {

        this.listeners.delete(listener);

    }

    /**
     * Notify listeners.
     */
    private notify(): void {

        if (!this.orderBook) {

            return;

        }

        const snapshot: OrderBook = {

            ...this.orderBook,

            bids: [...this.orderBook.bids],

            asks: [...this.orderBook.asks],

        };

        Object.freeze(snapshot.bids);

        Object.freeze(snapshot.asks);

        Object.freeze(snapshot);

        this.listeners.forEach(

            listener =>

                listener(snapshot)

        );

    }

}
