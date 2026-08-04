```typescript
/**
==========================================================
AURA Trade OS
Market Cache
Version : 0.1.0 Alpha
==========================================================
Market Data Cache Service
==========================================================
*/

import { CacheManager } from "./cacheManager";



/*
==========================================================
Types
==========================================================
*/

export interface CachedTicker {

    symbol: string;

    last: number;

    bid: number;

    ask: number;

    volume: number;

    timestamp: number;

}



export interface CachedCandle {

    timestamp: number;

    open: number;

    high: number;

    low: number;

    close: number;

    volume: number;

}



export interface CachedOrderBook {

    bids: number[][];

    asks: number[][];

    timestamp: number;

}





/*
==========================================================
Market Cache
==========================================================
*/

export class MarketCache {

    private readonly cache =

        new CacheManager<unknown>(60_000);





    /*
    ======================================================
    Ticker
    ======================================================
    */

    public setTicker(

        symbol: string,

        ticker: CachedTicker,

        ttl?: number,

    ): void {

        this.cache.set(

            `ticker:${symbol.toUpperCase()}`,

            ticker,

            ttl,

        );

    }



    public getTicker(

        symbol: string,

    ): CachedTicker | null {

        return this.cache.get(

            `ticker:${symbol.toUpperCase()}`,

        ) as CachedTicker | null;

    }





    /*
    ======================================================
    Candles
    ======================================================
    */

    public setCandles(

        symbol: string,

        timeframe: string,

        candles: CachedCandle[],

        ttl?: number,

    ): void {

        this.cache.set(

            `candles:${symbol.toUpperCase()}:${timeframe}`,

            candles,

            ttl,

        );

    }



    public getCandles(

        symbol: string,

        timeframe: string,

    ): CachedCandle[] | null {

        return this.cache.get(

            `candles:${symbol.toUpperCase()}:${timeframe}`,

        ) as CachedCandle[] | null;

    }





    /*
    ======================================================
    Order Book
    ======================================================
    */

    public setOrderBook(

        symbol: string,

        orderBook: CachedOrderBook,

        ttl?: number,

    ): void {

        this.cache.set(

            `orderbook:${symbol.toUpperCase()}`,

            orderBook,

            ttl,

        );

    }



    public getOrderBook(

        symbol: string,

    ): CachedOrderBook | null {

        return this.cache.get(

            `orderbook:${symbol.toUpperCase()}`,

        ) as CachedOrderBook | null;

    }





    /*
    ======================================================
    Remove Symbol
    ======================================================
    */

    public removeSymbol(

        symbol: string,

    ): void {

        const prefix =

            symbol.toUpperCase();

        for (

            const key

            of this.cache.keys()

        ) {

            if (

                key.includes(prefix)

            ) {

                this.cache.delete(key);

            }

        }

    }





    /*
    ======================================================
    Cleanup
    ======================================================
    */

    public cleanup(): number {

        return this.cache.cleanup();

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.cache.clear();

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public stats() {

        return this.cache.stats();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const marketCache =

    new MarketCache();
```

