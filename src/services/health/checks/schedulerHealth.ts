/**
==========================================================
AURA Trade OS
Scheduler Health Check
Version : 0.3.0 Alpha
==========================================================
Scheduler Health Monitoring

PERBAIKAN dari 0.2.0: sebelumnya "lastExecution" dilacak di
memori instance (this.lastExecution, di-update lewat
updateExecution() yang TIDAK PERNAH dipanggil dari mana pun).
Bahkan kalau dipanggil, state di memori proses Node TIDAK BISA
diandalkan di lingkungan serverless (Vercel) -- tiap invocation
berpotensi dapat instance/container baru yang tidak ingat apa-
apa dari invocation sebelumnya.

Sekarang baca scannerResults/latest.scannedAt dari Firestore --
timestamp SIKLUS CRON ASLI TERAKHIR yang sungguh-sungguh
berjalan (ditulis src/pages/api/cron/scan.ts tiap siklus),
bukan state di memori yang bisa hilang kapan saja.
==========================================================
*/

import logger from "@/services/logger";

import { adminDb } from "@/services/firebase/admin";



/*
==========================================================
Types
==========================================================
*/

export type SchedulerHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";


export interface SchedulerHealthReport {

    status: SchedulerHealthStatus;

    running: boolean;

    lastExecution?: Date;

    message: string;

    checkedAt: Date;

}


/*
==========================================================
Scheduler Health
==========================================================
*/

export class SchedulerHealth {

    /*
    ======================================================
    Check
    ======================================================
    */

    public async check(): Promise<SchedulerHealthReport> {

        try {

            const snapshot = await adminDb
                .collection("scannerResults")
                .doc("latest")
                .get();

            if (!snapshot.exists) {

                return {
                    status: "UNHEALTHY",
                    running: false,
                    message: "Belum pernah ada siklus cron yang tercatat.",
                    checkedAt: new Date(),
                };

            }

            const data = snapshot.data();

            const scannedAt = data?.scannedAt
                ? new Date(data.scannedAt)
                : null;

            if (!scannedAt || Number.isNaN(scannedAt.getTime())) {

                return {
                    status: "UNHEALTHY",
                    running: false,
                    message: "Timestamp siklus cron terakhir tidak valid.",
                    checkedAt: new Date(),
                };

            }

            const now = Date.now();

            const diff = now - scannedAt.getTime();

            const status = this.resolveStatus(diff);

            return {
                status,
                running: status !== "UNHEALTHY",
                lastExecution: scannedAt,
                message: this.message(status),
                checkedAt: new Date(),
            };

        }
        catch (error) {

            logger.error(
                "Scheduler health check failed.",
                error,
            );

            return {
                status: "UNHEALTHY",
                running: false,
                message: "Scheduler unavailable.",
                checkedAt: new Date(),
            };

        }

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


    /*
    ======================================================
    Resolve Status

    Ambang lebih longgar dari versi lama (60s/300s) --
    sejak scanner memindai SEMUA pair qualified (bukan
    cuma 10), satu siklus bisa makan waktu lebih lama.
    ======================================================
    */

    private resolveStatus(elapsedMS: number): SchedulerHealthStatus {

        if (elapsedMS < 300_000) {
            return "HEALTHY";
        }

        if (elapsedMS < 900_000) {
            return "WARNING";
        }

        return "UNHEALTHY";

    }


    /*
    ======================================================
    Message
    ======================================================
    */

    private message(status: SchedulerHealthStatus): string {

        switch (status) {

            case "HEALTHY":
                return "Scheduler operating normally.";

            case "WARNING":
                return "Scheduler execution delayed.";

            default:
                return "Scheduler not responding.";

        }

    }

}


/*
==========================================================
Singleton
==========================================================
*/

export const schedulerHealth = new SchedulerHealth();
