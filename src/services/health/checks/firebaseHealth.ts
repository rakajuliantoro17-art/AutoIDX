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

import { adminAuth } from "@/services/firebase/admin";





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
            Beda dari databaseHealth.ts (yang cek Firestore
            spesifik) -- ini cek Firebase Auth Admin SDK,
            dipakai memverifikasi ID token di HAMPIR SEMUA
            API route (mis. /api/portfolio/summary,
            /api/settings/config). listUsers(1) adalah
            operasi paling murah untuk memverifikasi kredensial
            Admin SDK & konektivitas Auth benar-benar berfungsi,
            tanpa efek samping apa pun.
            ==============================================
            */

            await adminAuth.listUsers(1);

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

