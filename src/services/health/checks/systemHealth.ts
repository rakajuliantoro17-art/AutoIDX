/**
==========================================================
AURA Trade OS
System Health
Version : 0.2.1 Alpha
==========================================================
Aggregate System Health

PERBAIKAN dari 0.2.0: schedulerHealth.check() sekarang async
(baca Firestore, bukan lagi state di memori -- lihat catatan di
schedulerHealth.ts) jadi harus di-await & masuk Promise.all
bersama check async lainnya.
==========================================================
*/

import { cacheHealth } from "./cacheHealth";

import { databaseHealth } from "./databaseHealth";

import { exchangeHealth } from "./exchangeHealth";

import { firebaseHealth } from "./firebaseHealth";

import { memoryHealth } from "./memoryHealth";

import { networkHealth } from "./networkHealth";

import { schedulerHealth } from "./schedulerHealth";



/*
==========================================================
Types
==========================================================
*/

export type SystemHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";


export interface SystemHealthReport {

    status: SystemHealthStatus;

    checks: {

        cache: ReturnType<
            typeof cacheHealth.check
        >;

        database: Awaited<
            ReturnType<
                typeof databaseHealth.check
            >
        >;

        exchange: Awaited<
            ReturnType<
                typeof exchangeHealth.check
            >
        >;

        firebase: Awaited<
            ReturnType<
                typeof firebaseHealth.check
            >
        >;

        memory: ReturnType<
            typeof memoryHealth.check
        >;

        network: Awaited<
            ReturnType<
                typeof networkHealth.check
            >
        >;

        scheduler: Awaited<
            ReturnType<
                typeof schedulerHealth.check
            >
        >;

    };

    checkedAt: Date;

}



/*
==========================================================
System Health
==========================================================
*/

export class SystemHealth {

    /*
    ======================================================
    Check
    ======================================================
    */

    public async check(): Promise<SystemHealthReport> {

        const [
            database,
            exchange,
            firebase,
            network,
            scheduler,
        ] = await Promise.all([
            databaseHealth.check(),
            exchangeHealth.check(),
            firebaseHealth.check(),
            networkHealth.check(),
            schedulerHealth.check(),
        ]);

        const cache = cacheHealth.check();

        const memory = memoryHealth.check();

        const statuses = [
            cache.status,
            database.status,
            exchange.status,
            firebase.status,
            memory.status,
            network.status,
            scheduler.status,
        ];

        let status: SystemHealthStatus = "HEALTHY";

        if (statuses.includes("UNHEALTHY")) {
            status = "UNHEALTHY";
        }
        else if (statuses.includes("WARNING")) {
            status = "WARNING";
        }

        return {
            status,
            checks: {
                cache,
                database,
                exchange,
                firebase,
                memory,
                network,
                scheduler,
            },
            checkedAt: new Date(),
        };

    }


    /*
    ======================================================
    Healthy
    ======================================================
    */

    public async isHealthy(): Promise<boolean> {

        const report = await this.check();

        return report.status === "HEALTHY";

    }

}



/*
==========================================================
Singleton
==========================================================
*/

export const systemHealth = new SystemHealth();
