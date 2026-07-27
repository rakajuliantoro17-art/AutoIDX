/**
==========================================================
AURA Trade OS
Public Ticker Service
Version : 0.1.1 Alpha
==========================================================
*/

import { PublicClient } from "./client";

import type {

    Ticker,

} from "../models/ticker";

export interface TickerQuery {

    symbol: string;

}

export class TickerService {

    constructor(

        private readonly client: PublicClient

    ) {}

    /**
     * Returns ticker
     * for one trading pair.
     */
    async get(

        query: TickerQuery

    ): Promise<Ticker> {

        return this.client.get<Ticker>(

            "/ticker",

            {

                symbol: query.symbol,

            }

        );

    }

    /**
     * Alias of get().
     */
    async latest(

        symbol: string

    ): Promise<Ticker> {

        return this.get({

            symbol,

        });

    }

    /**
     * Returns last traded price.
     */
    async lastPrice(

        symbol: string

    ): Promise<number> {

        const ticker =

            await this.latest(symbol);

        return ticker.lastPrice;

    }

    /**
     * Returns bid price.
     */
    async bid(

        symbol: string

    ): Promise<number> {

        const ticker =

            await this.latest(symbol);

        return ticker.bidPrice;

    }

    /**
     * Returns ask price.
     */
    async ask(

        symbol: string

    ): Promise<number> {

        const ticker =

            await this.latest(symbol);

        return ticker.askPrice;

    }

    /**
     * Returns spread.
     */
    async spread(

        symbol: string

    ): Promise<number> {

        const ticker =

            await this.latest(symbol);

        return (

            ticker.askPrice -

            ticker.bidPrice

        );

    }

    /**
     * Returns 24h price change.
     */
    async change24h(

        symbol: string

    ): Promise<number> {

        const ticker =

            await this.latest(symbol);

        return ticker.priceChangePercent;

    }

}

export default TickerService;
