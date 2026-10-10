/**
==========================================================
AURA Trade OS
Order Book Snapshot
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    OrderBook,

} from "@/services/exchange";


export interface OrderLevel {

    price: number;

    volume: number;

}


export interface OrderBookSnapshotData {

    symbol: string;

    bids: readonly OrderLevel[];

    asks: readonly OrderLevel[];

    bestBid: number;

    bestAsk: number;

    spread: number;

    spreadPercent: number;

    timestamp: number;

}


export class OrderBookSnapshot {

    private constructor(

        readonly data: OrderBookSnapshotData

    ) {}


    /**
     * Create snapshot from order book.
     */
    static fromOrderBook(

        orderBook: OrderBook

    ): OrderBookSnapshot {


        const bids = orderBook.bids.map(

            (level) => ({

                price: level.price,

                volume: level.quantity,

            })

        );


        const asks = orderBook.asks.map(

            (level) => ({

                price: level.price,

                volume: level.quantity,

            })

        );


        const bestBid =

            bids.length > 0

                ? bids[0].price

                : 0;


        const bestAsk =

            asks.length > 0

                ? asks[0].price

                : 0;


        const spread =

            bestAsk -

            bestBid;


        const spreadPercent =

            bestBid === 0

                ? 0

                :

                (

                    spread /

                    bestBid

                )

                * 100;


        return new OrderBookSnapshot({

            symbol:

                orderBook.symbol,

            bids,

            asks,

            bestBid,

            bestAsk,

            spread,

            spreadPercent,

            timestamp:

                Date.now(),

        });

    }


    /**
     * Returns total bid liquidity.
     */
    bidLiquidity(): number {

        return this.data.bids.reduce(

            (

                total,

                level

            ) =>

                total + level.volume,

            0

        );

    }


    /**
     * Returns total ask liquidity.
     */
    askLiquidity(): number {

        return this.data.asks.reduce(

            (

                total,

                level

            ) =>

                total + level.volume,

            0

        );

    }


    /**
     * Returns order book imbalance.
     */
    imbalance(): number {

        const bid =

            this.bidLiquidity();


        const ask =

            this.askLiquidity();


        const total =

            bid + ask;


        if (total === 0) {

            return 0;

        }


        return (

            bid -

            ask

        ) / total;

    }


    /**
     * Returns weighted midpoint price.
     */
    midPrice(): number {

        return (

            this.data.bestBid +

            this.data.bestAsk

        ) / 2;

    }


    /**
     * Export plain object.
     */
    toJSON(): OrderBookSnapshotData {

        return {

            ...this.data,

        };

    }

}
