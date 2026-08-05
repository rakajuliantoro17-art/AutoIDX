/**
==========================================================
AURA Trade OS
Memory Health Check
Version : 0.2.0 Alpha
==========================================================
Memory Health Monitoring
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type MemoryHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";





export interface MemoryHealthReport {

    status: MemoryHealthStatus;

    heapUsedMB: number;

    heapTotalMB: number;

    rssMB: number;

    externalMB: number;

    usagePercent: number;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Memory Health
==========================================================
*/

export class MemoryHealth {

    /*
    ======================================================
    Check
    ======================================================
    */

    public check():

        MemoryHealthReport {

        try {

            const memory =

                process.memoryUsage();



            const heapUsedMB =

                this.toMB(

                    memory.heapUsed,

                );



            const heapTotalMB =

                this.toMB(

                    memory.heapTotal,

                );



            const rssMB =

                this.toMB(

                    memory.rss,

                );



            const externalMB =

                this.toMB(

                    memory.external,

                );



            const usagePercent =

                heapTotalMB === 0

                    ? 0

                    : (

                        heapUsedMB /

                        heapTotalMB

                    ) * 100;



            const status =

                this.resolveStatus(

                    usagePercent,

                );



            return {

                status,

                heapUsedMB,

                heapTotalMB,

                rssMB,

                externalMB,

                usagePercent,

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

                "Memory health check failed.",

                error,

            );



            return {

                status:

                    "UNHEALTHY",

                heapUsedMB: 0,

                heapTotalMB: 0,

                rssMB: 0,

                externalMB: 0,

                usagePercent: 0,

                message:

                    "Memory information unavailable.",

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





    /*
    ======================================================
    Convert Bytes → MB
    ======================================================
    */

    private toMB(

        bytes: number,

    ): number {

        return Number(

            (

                bytes /

                1024 /

                1024

            ).toFixed(2),

        );

    }





    /*
    ======================================================
    Status
    ======================================================
    */

    private resolveStatus(

        usage: number,

    ): MemoryHealthStatus {

        if (usage < 70) {

            return "HEALTHY";

        }



        if (usage < 90) {

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

        status: MemoryHealthStatus,

    ): string {

        switch (status) {

            case "HEALTHY":

                return

                    "Memory usage is normal.";



            case "WARNING":

                return

                    "Memory usage is elevated.";



            default:

                return

                    "Memory usage is critical.";

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const memoryHealth =

    new MemoryHealth();
```

