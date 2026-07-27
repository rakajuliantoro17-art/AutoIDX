/**
==========================================================
AURA Trade OS
Public OHLCV Service
Version : 0.1.1 Alpha
==========================================================
*/

import { PublicClient } from "./client";

import type {

    Candle,
    CandleInterval,

} from "../models/candle";

export interface OHLCVQuery {

    symbol: string;

    interval: CandleInterval;

    limit?: number;

    from?: number;

    to?: number;

}

export class OHLCVService {

    constructor(

        private readonly client: PublicClient

    ) {}

    /**
     * Returns historical candles.
     */
    async get(

        query: OHLCVQuery

    ): Promise<Candle[]> {

        return this.client.get<Candle[]>(

            "/ohlcv",

            {

                symbol: query.symbol,

                interval: query.interval,

                limit: query.limit ?? 500,

                from: query.from ?? "",

                to: query.to ?? "",

            }

        );

    }

    /**
     * Returns latest candle.
     */
    async latest(

        symbol: string,

        interval: CandleInterval

    ): Promise<Candle | null> {

        const candles =

            await this.get({

                symbol,

                interval,

                limit: 1,

            });

        return candles[0] ?? null;

    }

    /**
     * Returns latest N candles.
     */
    async latestMany(

        symbol: string,

        interval: CandleInterval,

        limit = 100

    ): Promise<Candle[]> {

        return this.get({

            symbol,

            interval,

            limit,

        });

    }

    /**
     * Returns only closed candles.
     */
    async closed(

        symbol: string,

        interval: CandleInterval,

        limit = 100

    ): Promise<Candle[]> {

        const candles =

            await this.latestMany(

                symbol,

                interval,

                limit

            );

        return candles.filter(

            candle =>

                candle.closed

        );

    }

}

export default OHLCVService;
