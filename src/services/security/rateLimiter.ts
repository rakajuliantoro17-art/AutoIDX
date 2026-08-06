/**
==========================================================
AURA Trade OS
Rate Limiter
Version : 0.1.0 Alpha
==========================================================
Request Rate Limiter
==========================================================
*/

import { logger } from "@/services/logger";

/*
==========================================================
Types
==========================================================
*/

export interface RateLimitResult {

    success: boolean;

    remaining: number;

    resetAt: number;

    message: string;

}

interface Bucket {

    count: number;

    expiresAt: number;

}

/*
==========================================================
Rate Limiter
==========================================================
*/

export class RateLimiter {

    private readonly buckets =

        new Map<string, Bucket>();



    private readonly limit = 100;



    private readonly windowMS =

        60_000;





    /*
    ======================================================
    Check
    ======================================================
    */

    public check(

        key: string,

    ): RateLimitResult {

        const now = Date.now();

        const bucket =

            this.buckets.get(key);



        if (

            !bucket ||

            now >= bucket.expiresAt

        ) {

            this.buckets.set(

                key,

                {

                    count: 1,

                    expiresAt:

                        now +

                        this.windowMS,

                },

            );



            return {

                success: true,

                remaining:

                    this.limit - 1,

                resetAt:

                    now +

                    this.windowMS,

                message: "OK",

            };

        }



        if (

            bucket.count >=

            this.limit

        ) {

            logger.warn(

                "Rate limit exceeded.",

                {

                    key,

                },

            );



            return {

                success: false,

                remaining: 0,

                resetAt:

                    bucket.expiresAt,

                message:

                    "Too many requests.",

            };

        }



        bucket.count++;

        this.buckets.set(

            key,

            bucket,

        );



        return {

            success: true,

            remaining:

                this.limit -

                bucket.count,

            resetAt:

                bucket.expiresAt,

            message: "OK",

        };

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(

        key: string,

    ): void {

        this.buckets.delete(key);

    }





    /*
    ======================================================
    Clear

    Development Only
    ======================================================
    */

    public clear(): void {

        this.buckets.clear();

    }





    /*
    ======================================================
    Active Buckets
    ======================================================
    */

    public size(): number {

        return this.buckets.size;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const rateLimiter =

    new RateLimiter();

