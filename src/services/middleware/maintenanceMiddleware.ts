/**
==========================================================
AURA Trade OS
Maintenance Middleware
Version : 0.2.0 Alpha
==========================================================
Maintenance Mode Middleware
==========================================================
*/

import {

    maintenanceManager,

} from "@/services/maintenance/maintenanceManager";





/*
==========================================================
Types
==========================================================
*/

export interface MaintenanceResponse {

    success: boolean;

    status: number;

    message: string;

}





/*
==========================================================
Maintenance Middleware
==========================================================
*/

export class MaintenanceMiddleware {

    /*
    ======================================================
    Handle
    ======================================================
    */

    public async handle():

        Promise<MaintenanceResponse> {

        const enabled =

            await maintenanceManager.isEnabled();



        if (enabled) {

            return {

                success: false,

                status: 503,

                message:

                    "Service temporarily unavailable due to scheduled maintenance.",

            };

        }



        return {

            success: true,

            status: 200,

            message: "OK",

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const maintenanceMiddleware =

    new MaintenanceMiddleware();
```

