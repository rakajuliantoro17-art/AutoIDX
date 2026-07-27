/**
==========================================================
AURA Trade OS
Public Order Book Service
Version : 0.1.1 Alpha
==========================================================
*/

import { PublicClient } from "./client";

export interface OrderBookLevel {

    price: number;

    quantity: number;

}

export interface OrderBook {

    symbol: string;

    bids: OrderBookLevel[];

    asks: OrderBookLevel[];

    timestamp: number;

}

export interface OrderBookQuery {

    symbol: string;

    limit?: number;

}

export class OrderBookService {

    constructor(

        private readonly client: PublicClient

    ) {}

    /**
     * Returns market depth.
     */
    async get(

        query: OrderBookQuery

    ): Promise<OrderBook> {

        return this.client.get<OrderBook>(

            "/orderbook",

            {

                symbol: query.symbol,

                limit: query.limit ?? 50,

            }

        );

    }

    /**
     * Best bid level.
     */
    async bestBid(

        symbol: string

    ): Promise<OrderBookLevel | null> {

        const book =

            await this.get({

                symbol,

                limit: 1,

            });

        return book.bids[0] ?? null;

    }

    /**
     * Best ask level.
     */
    async bestAsk(

        symbol: string

    ): Promise<OrderBookLevel | null> {

        const book =

            await this.get({

                symbol,

                limit: 1,

            });

        return book.asks[0] ?? null;

    }

    /**
     * Bid / Ask spread.
     */
    async spread(

        symbol: string

    ): Promise<number> {

        const book =

            await this.get({

                symbol,

                limit: 1,

            });

        if (

            book.bids.length === 0 ||

            book.asks.length === 0

        ) {

            return 0;

        }

        return (

            book.asks[0].price -

            book.bids[0].price

        );

    }

    /**
     * Total bid quantity.
     */
    async bidVolume(

        symbol: string

    ): Promise<number> {

        const book =

            await this.get({

                symbol,

            });

        return book.bids.reduce(

            (

                total,

                level

            ) =>

                total + level.quantity,

            0

        );

    }

    /**
     * Total ask quantity.
     */
    async askVolume(

        symbol: string

    ): Promise<number> {

        const book =

            await this.get({

                symbol,

            });

        return book.asks.reduce(

            (

                total,

                level

            ) =>

                total + level.quantity,

            0

        );

    }

}

export default OrderBookService;
