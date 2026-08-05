/**
==========================================================
AURA Trade OS
Health Manager
Version : 0.2.0 Alpha
==========================================================
Central Health Manager
==========================================================
*/

import { logger } from "@/services/logger";

import {

    systemHealth,

    type SystemHealthReport,

} from "./checks/systemHealth";





/*
==========================================================
Health Manager
==========================================================
*/

export class HealthManager {

    private lastReport?:

        SystemHealthReport;





    /*
    ======================================================
    Check
    ======================================================
    */

    public async check():

        Promise<SystemHealthReport> {

        const report =

            await systemHealth.check();



        this.lastReport =

            report;



        logger.debug(

            `System Health: ${report.status}`,

        );



        return report;

    }





    /*
    ======================================================
    Last Report
    ======================================================
    */

    public getLastReport():

        SystemHealthReport |

        undefined {

        return this.lastReport;

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
    Status
    ======================================================
    */

    public async status():

        Promise<string> {

        const report =

            await this.check();



        return report.status;

    }





    /*
    ======================================================
    Refresh
    ======================================================
    */

    public async refresh():

        Promise<SystemHealthReport> {

        return this.check();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const healthManager =

    new HealthManager();
```

