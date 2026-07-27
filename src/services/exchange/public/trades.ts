/**
==========================================================
AURA Trade OS
Public Market Trade Service
Version : 0.1.1 Alpha
==========================================================
*/

import { PublicClient } from "./client";

import type {

    Trade,

} from "../models/trade";

export interface TradeQuery {

    symbol: string;

    limit?: number;

}

export class PublicTradeService {

    constructor(

        private readonly client: PublicClient

    ) {}

    /**
     * Returns recent public trades.
     */
    async getRecent(

        query: TradeQuery

    ): Promise<Trade[]> {

        return this.client.get<Trade[]>(

            "/trades",

            {

                symbol: query.symbol,

                limit: query.limit ?? 100,

            }

        );

    }

    /**
     * Returns latest market trade.
     */
    async getLatest(

        symbol: string

    ): Promise<Trade | null> {

        const trades =

            await this.getRecent({

                symbol,

                limit: 1,

            });

        return trades.length > 0

            ? trades[0]

            : null;

    }

    /**
     * Returns latest N trades.
     */
    async latest(

        symbol: string,

        limit = 20

    ): Promise<Trade[]> {

        return this.getRecent({

            symbol,

            limit,

        });

    }

}

export default PublicTradeService;
