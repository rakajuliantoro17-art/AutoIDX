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
            Cek konektivitas internet umum (BUKAN Indodax
            spesifik -- itu sudah dicek terpisah di
            exchangeHealth.ts). HEAD request ke endpoint
            publik yang stabil & cepat, timeout 3 detik
            supaya tidak menggantung kalau jaringan benar-
            benar putus.
            ==============================================
            */

            const controller = new AbortController();

            const timeoutId = setTimeout(
                () => controller.abort(),
                3000
            );

            const response = await fetch(
                "https://www.google.com",
                {
                    method: "HEAD",
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {

                throw new Error(
                    `Network check gagal (status ${response.status}).`
                );

            }

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

