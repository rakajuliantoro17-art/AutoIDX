/**
==========================================================
AURA Trade OS
Market Manager
Version : 0.1.1 Alpha
==========================================================
*/

import {

    MarketRegistry,

    MarketRegistryEntry,

} from "@/services/market/registry";


import {

    MarketSymbol,

    Timeframe,

} from "@/services/market/types";


import {

    MarketSnapshot,

} from "@/services/market/snapshots";


export interface MarketManagerOptions {

    defaultTimeframe?: Timeframe;

}


export class MarketManager {


    private readonly defaultTimeframe: Timeframe;


    constructor(

        options: MarketManagerOptions = {}

    ) {

        this.defaultTimeframe =

            options.defaultTimeframe ?? "5m";

    }



    /**
     * Initialize market.
     */
    initialize(

        symbol: MarketSymbol

    ): MarketRegistryEntry {


        return MarketRegistry.register(

            symbol

        );

    }



    /**
     * Get market instance.
     */
    getMarket(

        symbol: MarketSymbol

    ):


        | MarketRegistryEntry

        | undefined {


        return MarketRegistry.get(

            symbol

        );

    }



    /**
     * Remove market.
     */
    removeMarket(

        symbol: MarketSymbol

    ): void {


        MarketRegistry.unregister(

            symbol

        );

    }



    /**
     * List active markets.
     */
    markets():

        readonly MarketRegistryEntry[] {


        return MarketRegistry.all();

    }



    /**
     * Create market snapshot.
     */
    createSnapshot(

        symbol: MarketSymbol

    ):


        | MarketSnapshot

        | undefined {


        const market =

            this.getMarket(

                symbol

            );


        if (!market) {

            return undefined;

        }


        return MarketSnapshot.create({

            symbol,


            timestamp:

                Date.now(),


            filters: {},

        });

    }



    /**
     * Shutdown market system.
     */
    shutdown(): void {


        MarketRegistry.clear();

    }


}
