/**
==========================================================
AURA Trade OS
Network Manager
Version : 0.3.0 Alpha
==========================================================
Network Layer Orchestrator
==========================================================
*/

import { logger } from "@/services/logger";

import { bandwidthMonitor } from "./bandwidthMonitor";
import { connectionPool } from "./connectionPool";
import { dnsResolver } from "./dnsResolver";
import { proxyManager } from "./proxyManager";
import { networkHealth } from "./networkHealth";
import { networkMetrics } from "./networkMetrics";





/*
==========================================================
Network Manager
==========================================================
*/

export class NetworkManager {

    /*
    ======================================================
    Initialize
    ======================================================
    */

    public async initialize():

        Promise<void> {

        logger.info(

            "Initializing network services.",

        );

    }





    /*
    ======================================================
    Shutdown
    ======================================================
    */

    public async shutdown():

        Promise<void> {

        connectionPool.clear();

        proxyManager.disable();



        logger.info(

            "Network services stopped.",

        );

    }





    /*
    ======================================================
    Health
    ======================================================
    */

    public async health() {

        return

            networkHealth.report();

    }





    /*
    ======================================================
    Metrics
    ======================================================
    */

    public async metrics() {

        return

            networkMetrics.snapshot();

    }





    /*
    ======================================================
    Resolve
    ======================================================
    */

    public async resolve(

        hostname: string,

    ) {

        return

            dnsResolver.resolve(

                hostname,

            );

    }





    /*
    ======================================================
    Bandwidth
    ======================================================
    */

    public bandwidth() {

        return

            bandwidthMonitor.current();

    }





    /*
    ======================================================
    Connections
    ======================================================
    */

    public connections() {

        return

            connectionPool.active();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const networkManager =

    new NetworkManager();
```

