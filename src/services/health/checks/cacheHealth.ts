/**
==========================================================
AURA Trade OS
Cache Health Check
Version : 0.2.0 Alpha
==========================================================
Cache Health Monitoring
==========================================================
*/

import { logger } from "@/services/logger";

import {

    cacheManager,

} from "@/services/cache/cacheManager";





/*
==========================================================
Types
==========================================================
*/

export type CacheHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";





export interface CacheHealthReport {

    status: CacheHealthStatus;

    cacheItems: number;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Cache Health
==========================================================
*/

export class CacheHealth {

    /*
    ======================================================
    Check
    ======================================================
    */

    public check():

        CacheHealthReport {

        try {

            const cacheItems =

                cacheManager.size();



            const status: CacheHealthStatus =

                cacheItems >= 0

                    ? "HEALTHY"

                    : "UNHEALTHY";



            return {

                status,

                cacheItems,

                message:

                    status ===

                    "HEALTHY"

                        ? "Cache system operational."

                        : "Cache system unavailable.",

                checkedAt:

                    new Date(),

            };

        }

        catch (error) {

            logger.error(

                "Cache health check failed.",

                error,

            );



            return {

                status:

                    "UNHEALTHY",

                cacheItems: 0,

                message:

                    "Cache health check failed.",

                checkedAt:

                    new Date(),

            };

        }

    }





    /*
    ======================================================
    Healthy
    ======================================================
    */

    public isHealthy():

        boolean {

        return (

            this.check()

                .status ===

            "HEALTHY"

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const cacheHealth =

    new CacheHealth();
```

