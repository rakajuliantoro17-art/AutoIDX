/**
==========================================================
AURA Trade OS
Cache Policy
Version : 0.3.0 Alpha
==========================================================
Cache Policy Definitions
==========================================================
*/





/*
==========================================================
Types
==========================================================
*/

export type CacheStrategy =

    | "cache-first"

    | "network-first"

    | "stale-while-revalidate"

    | "cache-only"

    | "network-only";





export interface CachePolicy {

    ttlSeconds: number;

    strategy: CacheStrategy;

    allowStale: boolean;

    autoRefresh: boolean;

}





/*
==========================================================
Policies
==========================================================
*/

export const cachePolicies = {





    /*
    ======================================================
    Default
    ======================================================
    */

    default: {

        ttlSeconds: 300,

        strategy:

            "cache-first",

        allowStale: true,

        autoRefresh: false,

    } satisfies CachePolicy,





    /*
    ======================================================
    Market
    ======================================================
    */

    market: {

        ttlSeconds: 10,

        strategy:

            "network-first",

        allowStale: false,

        autoRefresh: true,

    } satisfies CachePolicy,





    /*
    ======================================================
    Portfolio
    ======================================================
    */

    portfolio: {

        ttlSeconds: 60,

        strategy:

            "cache-first",

        allowStale: true,

        autoRefresh: true,

    } satisfies CachePolicy,





    /*
    ======================================================
    Exchange
    ======================================================
    */

    exchange: {

        ttlSeconds: 30,

        strategy:

            "network-first",

        allowStale: false,

        autoRefresh: true,

    } satisfies CachePolicy,





    /*
    ======================================================
    Runtime
    ======================================================
    */

    runtime: {

        ttlSeconds: 5,

        strategy:

            "cache-first",

        allowStale: false,

        autoRefresh: false,

    } satisfies CachePolicy,

};





/*
==========================================================
Helper
==========================================================
*/

export function getCachePolicy(

    name: keyof typeof cachePolicies,

): CachePolicy {

    return cachePolicies[name];

}
```

