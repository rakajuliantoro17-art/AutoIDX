/**
==========================================================
AURA Trade OS
Exchange Health Check
Version : 0.2.0 Alpha
==========================================================
Exchange Health Monitoring
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type ExchangeHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";





export interface ExchangeHealthReport {

    status: ExchangeHealthStatus;

    latency: number;

    exchange: string;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Exchange Health
==========================================================
*/

export class ExchangeHealth {

    private readonly exchange =

        "Indodax";





    /*
    ======================================================
    Check
    ======================================================
    */

    public async check():

        Promise<ExchangeHealthReport> {

        const started =

            Date.now();

        try {

            /*
            ==============================================

            TODO

            Ping Exchange API

            Example:

            await exchangeService.ping();

            ==============================================
            */

            const latency =

                Date.now() -

                started;

            const status:

                ExchangeHealthStatus =

                latency < 300

                    ? "HEALTHY"

                    : latency < 1000

                    ? "WARNING"

                    : "UNHEALTHY";



            return {

                status,

                latency,

                exchange:

                    this.exchange,

                message:

                    "Exchange connection operational.",

                checkedAt:

                    new Date(),

            };

        }

        catch (error) {

            logger.error(

                "Exchange health check failed.",

                error,

            );



            return {

                status:

                    "UNHEALTHY",

                latency:

                    Date.now() -

                    started,

                exchange:

                    this.exchange,

                message:

                    "Exchange unavailable.",

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

    public async isHealthy():

        Promise<boolean> {

        const report =

            await this.check();



        return (

            report.status ===

            "HEALTHY"

        );

    }





    /*
    ======================================================
    Exchange Name
    ======================================================
    */

    public getExchange():

        string {

        return this.exchange;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const exchangeHealth =

    new ExchangeHealth();
```

