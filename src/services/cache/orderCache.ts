```typescript
/**
==========================================================
AURA Trade OS
Order Cache
Version : 0.1.0 Alpha
==========================================================
Order Cache Service
==========================================================
*/

import { CacheManager } from "./cacheManager";



/*
==========================================================
Types
==========================================================
*/

export interface CachedOrder {

    id: string;

    symbol: string;

    side: "BUY" | "SELL";

    type:
        | "MARKET"
        | "LIMIT"
        | "STOP"
        | "TAKE_PROFIT";

    status:
        | "PENDING"
        | "OPEN"
        | "PARTIALLY_FILLED"
        | "FILLED"
        | "CANCELLED"
        | "REJECTED";

    quantity: number;

    filledQuantity: number;

    price: number;

    createdAt: number;

    updatedAt: number;

}





/*
==========================================================
Order Cache
==========================================================
*/

export class OrderCache {

    private readonly cache =

        new CacheManager<CachedOrder>(

            300_000,

        );





    /*
    ======================================================
    Set
    ======================================================
    */

    public set(

        order: CachedOrder,

        ttl?: number,

    ): void {

        this.cache.set(

            order.id,

            order,

            ttl,

        );

    }





    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        orderId: string,

    ): CachedOrder | null {

        return this.cache.get(orderId);

    }





    /*
    ======================================================
    Update
    ======================================================
    */

    public update(

        orderId: string,

        partial: Partial<CachedOrder>,

    ): CachedOrder | null {

        const current =

            this.cache.get(orderId);

        if (!current) {

            return null;

        }

        const updated = {

            ...current,

            ...partial,

            updatedAt: Date.now(),

        };

        this.cache.set(

            orderId,

            updated,

        );

        return updated;

    }





    /*
    ======================================================
    Delete
    ======================================================
    */

    public delete(

        orderId: string,

    ): boolean {

        return this.cache.delete(

            orderId,

        );

    }





    /*
    ======================================================
    Get By Symbol
    ======================================================
    */

    public getBySymbol(

        symbol: string,

    ): CachedOrder[] {

        const results: CachedOrder[] = [];

        for (

            const key

            of this.cache.keys()

        ) {

            const order =

                this.cache.get(key);

            if (

                order &&

                order.symbol.toUpperCase() ===

                symbol.toUpperCase()

            ) {

                results.push(order);

            }

        }

        return results;

    }





    /*
    ======================================================
    Get Open Orders
    ======================================================
    */

    public getOpenOrders(): CachedOrder[] {

        const results: CachedOrder[] = [];

        for (

            const key

            of this.cache.keys()

        ) {

            const order =

                this.cache.get(key);

            if (

                !order

            ) {

                continue;

            }

            if (

                order.status === "OPEN" ||

                order.status === "PENDING" ||

                order.status === "PARTIALLY_FILLED"

            ) {

                results.push(order);

            }

        }

        return results;

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

export const orderCache =

    new OrderCache();
```

