/**
==========================================================
AURA Trade OS
Service Health
Version : 0.3.0 Alpha
==========================================================
Discovery Service Health Adapter
==========================================================
*/

import { logger } from "@/services/logger";
import { healthManager } from "@/services/health";





/*
==========================================================
Types
==========================================================
*/

export type ServiceHealthStatus =

    | "healthy"

    | "degraded"

    | "unhealthy"

    | "unknown";





export interface ServiceHealth {

    service: string;

    status: ServiceHealthStatus;

    checkedAt: Date;

}





/*
==========================================================
Service Health
==========================================================
*/

export class ServiceHealthManager {

    /*
    ======================================================
    Get
    ======================================================
    */

    public async get(

        service: string,

    ): Promise<ServiceHealth> {

        const report =

            await healthManager.check();



        const status:

            ServiceHealthStatus =

            report.healthy

                ? "healthy"

                : "unhealthy";



        logger.debug(

            `Service health requested: ${service}`,

        );



        return {

            service,

            status,

            checkedAt:

                new Date(),

        };

    }





    /*
    ======================================================
    Healthy
    ======================================================
    */

    public async isHealthy(

        service: string,

    ): Promise<boolean> {

        const result =

            await this.get(

                service,

            );



        return (

            result.status ===

            "healthy"

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const serviceHealth =

    new ServiceHealthManager();
```

