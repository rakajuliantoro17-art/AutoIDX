/**
==========================================================
AURA Trade OS
Intelligence Cache
Version : 0.1.0 Alpha
==========================================================
*/

export interface CacheEntry<T> {

    value: T;

    expiresAt: number;

}



export class IntelligenceCache {

    private readonly cache =

        new Map<

            string,

            CacheEntry<unknown>

        >();



    /**
     * Store cache value.
     */
    set<T>(

        key: string,

        value: T,

        ttl: number = 60_000

    ): void {

        this.cache.set(

            key,

            {

                value,

                expiresAt:

                    Date.now() + ttl,

            }

        );

    }



    /**
     * Read cache value.
     */
    get<T>(

        key: string

    ): T | null {

        const entry =

            this.cache.get(

                key

            );



        if (

            !entry

        ) {

            return null;

        }



        if (

            Date.now() >

            entry.expiresAt

        ) {

            this.cache.delete(

                key

            );

            return null;

        }



        return entry.value as T;

    }



    /**
     * Cache existence.
     */
    has(

        key: string

    ): boolean {

        return this.get(

            key

        ) !== null;

    }



    /**
     * Remove one cache.
     */
    delete(

        key: string

    ): boolean {

        return this.cache.delete(

            key

        );

    }



    /**
     * Clear all cache.
     */
    clear(): void {

        this.cache.clear();

    }



    /**
     * Remove expired entries.
     */
    cleanup(): void {

        const now =

            Date.now();



        for (

            const [

                key,

                value,

            ]

            of

            this.cache.entries()

        ) {

            if (

                now >

                value.expiresAt

            ) {

                this.cache.delete(

                    key

                );

            }

        }

    }



    /**
     * Total cache entries.
     */
    size(): number {

        return this.cache.size;

    }

}



const intelligenceCache =

    new IntelligenceCache();



export default intelligenceCache;
