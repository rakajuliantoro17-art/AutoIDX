```typescript
/**
==========================================================
AURA Trade OS
Strategy Cache
Version : 0.1.0 Alpha
==========================================================
Strategy & Indicator Cache
==========================================================
*/

import { CacheManager } from "./cacheManager";



/*
==========================================================
Types
==========================================================
*/

export interface CachedIndicator {

    name: string;

    value: unknown;

    timestamp: number;

}



export interface CachedStrategySignal {

    symbol: string;

    timeframe: string;

    strategy: string;

    action:

        | "BUY"

        | "SELL"

        | "HOLD";

    confidence: number;

    indicators: CachedIndicator[];

    timestamp: number;

}





/*
==========================================================
Strategy Cache
==========================================================
*/

export class StrategyCache {

    private readonly cache =

        new CacheManager<CachedStrategySignal>(

            30_000,

        );





    /*
    ======================================================
    Key
    ======================================================
    */

    private key(

        symbol: string,

        timeframe: string,

        strategy: string,

    ): string {

        return [

            symbol.toUpperCase(),

            timeframe,

            strategy,

        ].join(":");

    }





    /*
    ======================================================
    Set
    ======================================================
    */

    public set(

        signal: CachedStrategySignal,

        ttl?: number,

    ): void {

        this.cache.set(

            this.key(

                signal.symbol,

                signal.timeframe,

                signal.strategy,

            ),

            signal,

            ttl,

        );

    }





    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        symbol: string,

        timeframe: string,

        strategy: string,

    ): CachedStrategySignal | null {

        return this.cache.get(

            this.key(

                symbol,

                timeframe,

                strategy,

            ),

        );

    }





    /*
    ======================================================
    Delete
    ======================================================
    */

    public delete(

        symbol: string,

        timeframe: string,

        strategy: string,

    ): boolean {

        return this.cache.delete(

            this.key(

                symbol,

                timeframe,

                strategy,

            ),

        );

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

                key.startsWith(prefix)

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

export const strategyCache =

    new StrategyCache();
```

