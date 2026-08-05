/**
==========================================================
AURA Trade OS
Distributed Cache
Version : 0.3.0 Alpha
==========================================================
Distributed Cache Adapter
==========================================================
*/

import {

    CacheEntry,

    CacheStore,

} from "./cacheStore";





/*
==========================================================
Distributed Cache
==========================================================
*/

export class DistributedCache

implements CacheStore {

    private readonly storage =

        new Map<

            string,

            CacheEntry<unknown>

        >();





    /*
    ======================================================
    Get
    ======================================================
    */

    public async get<T>(

        key: string,

    ): Promise<T | undefined> {

        const entry =

            this.storage.get(

                key,

            );



        if (!entry) {

            return undefined;

        }



        if (

            entry.expiresAt &&

            entry.expiresAt <

            new Date()

        ) {

            this.storage.delete(

                key,

            );



            return undefined;

        }



        return entry.value as T;

    }





    /*
    ======================================================
    Set
    ======================================================
    */

    public async set<T>(

        key: string,

        value: T,

        ttlSeconds?: number,

    ): Promise<void> {

        this.storage.set(

            key,

            {

                value,

                createdAt:

                    new Date(),

                expiresAt:

                    ttlSeconds

                        ? new Date(

                              Date.now() +

                              ttlSeconds *

                                  1000,

                          )

                        : undefined,

            },

        );

    }





    /*
    ======================================================
    Has
    ======================================================
    */

    public async has(

        key: string,

    ): Promise<boolean> {

        return (

            await this.get(

                key,

            )

        ) !== undefined;

    }





    /*
    ======================================================
    Delete
    ======================================================
    */

    public async delete(

        key: string,

    ): Promise<boolean> {

        return this.storage.delete(

            key,

        );

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public async clear():

        Promise<void> {

        this.storage.clear();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const distributedCache =

    new DistributedCache();
```

