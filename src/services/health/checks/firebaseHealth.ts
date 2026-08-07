/**
==========================================================
AURA Trade OS
Firebase Health Check
Version : 0.2.0 Alpha
==========================================================
Firebase Service Health Monitoring
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type FirebaseHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";





export interface FirebaseHealthReport {

    status: FirebaseHealthStatus;

    latency: number;

    service: string;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Firebase Health
==========================================================
*/

export class FirebaseHealth {

    private readonly service =

        "Firebase";





    /*
    ======================================================
    Check
    ======================================================
    */

    public async check():

        Promise<FirebaseHealthReport> {

        const started =

            Date.now();

        try {

            /*
            ==============================================

            TODO

            Firebase connectivity check.

            Example:

            await firebaseService.health();

            ==============================================
            */

            const latency =

                Date.now() -

                started;



            const status:

                FirebaseHealthStatus =

                latency < 300

                    ? "HEALTHY"

                    : latency < 1000

                    ? "WARNING"

                    : "UNHEALTHY";



            return {

                status,

                latency,

                service:

                    this.service,

                message:

                    "Firebase service operational.",

                checkedAt:

                    new Date(),

            };

        }

        catch (error) {

            logger.error(

                "Firebase health check failed.",

                error,

            );



            return {

                status:

                    "UNHEALTHY",

                latency:

                    Date.now() -

                    started,

                service:

                    this.service,

                message:

                    "Firebase unavailable.",

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
    Service Name
    ======================================================
    */

    public getService():

        string {

        return this.service;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const firebaseHealth =

    new FirebaseHealth();

