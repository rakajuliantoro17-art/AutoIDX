/**
==========================================================
AURA Trade OS
Network Health Check
Version : 0.2.0 Alpha
==========================================================
Network Health Monitoring
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type NetworkHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";





export interface NetworkHealthReport {

    status: NetworkHealthStatus;

    latency: number;

    reachable: boolean;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Network Health
==========================================================
*/

export class NetworkHealth {

    /*
    ======================================================
    Check
    ======================================================
    */

    public async check():

        Promise<NetworkHealthReport> {

        const started =

            Date.now();

        try {

            /*
            ==============================================

            TODO

            Network connectivity check.

            Example:

            await fetch(
                "https://example.com",
                {
                    method: "HEAD",
                },
            );

            ==============================================
            */

            const latency =

                Date.now() -

                started;



            const status =

                this.resolveStatus(

                    latency,

                );



            return {

                status,

                latency,

                reachable: true,

                message:

                    this.message(

                        status,

                    ),

                checkedAt:

                    new Date(),

            };

        }

        catch (error) {

            logger.error(

                "Network health check failed.",

                error,

            );



            return {

                status:

                    "UNHEALTHY",

                latency:

                    Date.now() -

                    started,

                reachable: false,

                message:

                    "Network unavailable.",

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
    Resolve Status
    ======================================================
    */

    private resolveStatus(

        latency: number,

    ): NetworkHealthStatus {

        if (latency < 200) {

            return "HEALTHY";

        }



        if (latency < 1000) {

            return "WARNING";

        }



        return "UNHEALTHY";

    }





    /*
    ======================================================
    Message
    ======================================================
    */

    private message(

        status: NetworkHealthStatus,

    ): string {

        switch (status) {

            case "HEALTHY":

                return "Network connection is stable.";



            case "WARNING":

                return "Network latency is elevated.";



            default:

                return "Network connection is unstable.";

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const networkHealth =

    new NetworkHealth();

