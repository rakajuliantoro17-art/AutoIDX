/**
==========================================================
AURA Trade OS
Database Health Check
Version : 0.2.0 Alpha
==========================================================
Database Health Monitoring
==========================================================
*/

import logger from "@/services/logger";

import { adminDb } from "@/services/firebase/admin";





/*
==========================================================
Types
==========================================================
*/

export type DatabaseHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";





export interface DatabaseHealthReport {

    status: DatabaseHealthStatus;

    latency: number;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Database Health
==========================================================
*/

export class DatabaseHealth {

    /*
    ======================================================
    Check
    ======================================================
    */

    public async check():

        Promise<DatabaseHealthReport> {

        const started =

            Date.now();

        try {

            /*
            ==============================================
            Ping Firestore beneran -- baca 1 dokumen kecil
            (bot_control, sudah dibaca tiap siklus trading
            juga) supaya latency yang diukur mencerminkan
            koneksi Firestore yang sesungguhnya, bukan cuma
            waktu try-block kosong (0ms, selalu "HEALTHY"
            walau Firestore sebenarnya down).
            ==============================================
            */

            await adminDb
                .collection("bot_control")
                .doc("default")
                .get();

            const latency =

                Date.now() -

                started;

            return {

                status:

                    latency < 500

                        ? "HEALTHY"

                        : "WARNING",

                latency,

                message:

                    "Database connection operational.",

                checkedAt:

                    new Date(),

            };

        }

        catch (error) {

            logger.error(

                "Database health check failed.",

                error,

            );

            return {

                status:

                    "UNHEALTHY",

                latency:

                    Date.now() -

                    started,

                message:

                    "Database unavailable.",

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

}





/*
==========================================================
Singleton
==========================================================
*/

export const databaseHealth =

    new DatabaseHealth();

