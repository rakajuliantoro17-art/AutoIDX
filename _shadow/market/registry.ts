/**
==========================================================
AURA Trade OS
Market Registry
Version : 0.1.1 Alpha
==========================================================
*/

import {

    TickerFeed,

    CandleFeed,

    TradeFeed,

    OrderBookFeed,

} from "@/services/market/feeds";


import {

    MarketSymbol,

    Timeframe,

} from "@/services/market/types";


export interface MarketRegistryEntry {

    symbol: MarketSymbol;


    tickerFeed: TickerFeed;


    candleFeeds: Map<

        Timeframe,

        CandleFeed

    >;


    tradeFeed: TradeFeed;


    orderBookFeed: OrderBookFeed;

}



export class MarketRegistry {


    private static markets =

        new Map<

            MarketSymbol,

            MarketRegistryEntry

        >();



    /**
     * Register market symbol.
     */
    static register(

        symbol: MarketSymbol

    ): MarketRegistryEntry {


        const existing =

            this.markets.get(symbol);


        if (existing) {

            return existing;

        }



        const entry: MarketRegistryEntry = {


            symbol,


            tickerFeed:

                new TickerFeed({

                    symbol,

                }),



            candleFeeds:

                new Map(),



            tradeFeed:

                new TradeFeed({

                    symbol,

                }),



            orderBookFeed:

                new OrderBookFeed({

                    symbol,

                }),


        };



        this.markets.set(

            symbol,

            entry

        );


        return entry;

    }



    /**
     * Get market instance.
     */
    static get(

        symbol: MarketSymbol

    ):

        | MarketRegistryEntry

        | undefined {


        return this.markets.get(

            symbol

        );

    }



    /**
     * Check market exists.
     */
    static has(

        symbol: MarketSymbol

    ): boolean {


        return this.markets.has(

            symbol

        );

    }



    /**
     * Remove market.
     */
    static unregister(

        symbol: MarketSymbol

    ): void {


        this.markets.delete(

            symbol

        );

    }



    /**
     * Get all markets.
     */
    static all():

        readonly MarketRegistryEntry[] {


        return Array.from(

            this.markets.values()

        );

    }



    /**
     * Clear registry.
     */
    static clear(): void {


        this.markets.clear();

    }


}
