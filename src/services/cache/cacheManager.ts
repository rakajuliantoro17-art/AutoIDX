```typescript
/**
==========================================================
AURA Trade OS
Cache Manager
Version : 0.1.0 Alpha
==========================================================
Generic In-Memory Cache Manager
==========================================================
*/

interface CacheEntry<T> {

    value: T;

    createdAt: number;

    expiresAt: number;

}

export interface CacheStats {

    size: number;

    expired: number;

}

export class CacheManager<T> {

    private readonly storage =

        new Map<string, CacheEntry<T>>();

    constructor(

        private readonly defaultTTL = 60_000,

    ) {}



    /*
    ==========================================================
    Set
    ==========================================================
    */

    public set(

        key: string,

        value: T,

        ttl?: number,

    ): void {

        const now = Date.now();

        this.storage.set(

            key,

            {

                value,

                createdAt: now,

                expiresAt:

                    now +

                    (ttl ?? this.defaultTTL),

            },

        );

    }



    /*
    ==========================================================
    Get
    ==========================================================
    */

    public get(

        key: string,

    ): T | null {

        const item =

            this.storage.get(key);

        if (!item) {

            return null;

        }

        if (

            item.expiresAt <=

            Date.now()

        ) {

            this.storage.delete(key);

            return null;

        }

        return item.value;

    }



    /*
    ==========================================================
    Has
    ==========================================================
    */

    public has(

        key: string,

    ): boolean {

        return this.get(key) !== null;

    }



    /*
    ==========================================================
    Delete
    ==========================================================
    */

    public delete(

        key: string,

    ): boolean {

        return this.storage.delete(key);

    }



    /*
    ==========================================================
    Clear
    ==========================================================
    */

    public clear(): void {

        this.storage.clear();

    }



    /*
    ==========================================================
    Cleanup
    ==========================================================
    */

    public cleanup(): number {

        let removed = 0;

        const now = Date.now();

        for (

            const [key, value]

            of this.storage

        ) {

            if (

                value.expiresAt <= now

            ) {

                this.storage.delete(key);

                removed++;

            }

        }

        return removed;

    }



    /*
    ==========================================================
    Keys
    ==========================================================
    */

    public keys(): string[] {

        return [

            ...this.storage.keys(),

        ];

    }



    /*
    ==========================================================
    Size
    ==========================================================
    */

    public size(): number {

        return this.storage.size;

    }



    /*
    ==========================================================
    Statistics
    ==========================================================
    */

    public stats(): CacheStats {

        let expired = 0;

        const now = Date.now();

        for (

            const value

            of this.storage.values()

        ) {

            if (

                value.expiresAt <= now

            ) {

                expired++;

            }

        }

        return {

            size:

                this.storage.size,

            expired,

        };

    }

}



/*
==========================================================
Default Cache
==========================================================
*/

export const cacheManager =

    new CacheManager();
```

