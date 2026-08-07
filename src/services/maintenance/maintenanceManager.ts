/**
==========================================================
AURA Trade OS
Maintenance Manager
Version : 0.1.0 Alpha
==========================================================
System Maintenance Mode Toggle
==========================================================
*/

import logger from "@/services/logger";




/*
==========================================================
Maintenance Manager
==========================================================
*/

export class MaintenanceManager {

    private enabled: boolean = false;



    /*
    ======================================================
    Is Enabled
    ======================================================
    */

    async isEnabled(): Promise<boolean> {

        return this.enabled;

    }



    /*
    ======================================================
    Enable / Disable
    ======================================================
    */

    enable(): void {

        this.enabled = true;

        logger.warn("Maintenance mode enabled.");

    }

    disable(): void {

        this.enabled = false;

        logger.info("Maintenance mode disabled.");

    }

}




/*
==========================================================
Singleton
==========================================================
*/

export const maintenanceManager = new MaintenanceManager();
