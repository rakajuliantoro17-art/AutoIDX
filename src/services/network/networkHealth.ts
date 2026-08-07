/**
==========================================================
AURA Trade OS
Network Health
Version : 0.3.0 Alpha
==========================================================
Local Network Module Health Status
==========================================================
*/

import logger from "@/services/logger";




/*
==========================================================
Types
==========================================================
*/

export type NetworkHealthState =

    "HEALTHY" |

    "DEGRADED" |

    "DOWN";



export interface NetworkHealthReport {

    status: NetworkHealthState;

    healthy: boolean;

    checkedAt: Date;

}




/*
==========================================================
Network Health
==========================================================
*/

export class NetworkHealth {

    private lastReport: NetworkHealthReport = {

        status: "HEALTHY",

        healthy: true,

        checkedAt: new Date(),

    };



    /*
    ======================================================
    Report
    ======================================================
    */

    report(): NetworkHealthReport {

        return this.lastReport;

    }



    /*
    ======================================================
    Is Healthy
    ======================================================
    */

    async isHealthy(): Promise<boolean> {

        try {

            this.lastReport = {

                status: "HEALTHY",

                healthy: true,

                checkedAt: new Date(),

            };

            return true;

        } catch (err: any) {

            this.lastReport = {

                status: "DOWN",

                healthy: false,

                checkedAt: new Date(),

            };

            logger.error("Network health check failed.", { error: err?.message || err });

            return false;

        }

    }

}




/*
==========================================================
Singleton
==========================================================
*/

export const networkHealth = new NetworkHealth();
