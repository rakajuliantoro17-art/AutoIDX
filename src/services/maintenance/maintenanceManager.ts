/**
==========================================================
AURA Trade OS
Maintenance Manager
Version : 0.2.0 Alpha
==========================================================
Maintenance Mode Adapter
==========================================================
*/

import { applicationContext } from "@/services/core/applicationContext";

export class MaintenanceManager {

    public async isEnabled(): Promise<boolean> {
        return applicationContext.isMaintenance();
    }

    public async enable(): Promise<void> {
        applicationContext.enableMaintenance();
    }

    public async disable(): Promise<void> {
        applicationContext.disableMaintenance();
    }

}

export const maintenanceManager =
    new MaintenanceManager();
