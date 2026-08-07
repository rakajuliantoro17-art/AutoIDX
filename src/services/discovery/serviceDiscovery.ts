/**
==========================================================
AURA Trade OS
Service Discovery
Version : 0.3.0 Alpha
==========================================================
Discovery Facade
==========================================================
*/

import logger from "@/services/logger";

import {

    discoveryRegistry,

} from "./serviceRegistry";

import {

    serviceResolver,

} from "./serviceResolver";

import {

    serviceHeartbeat,

} from "./serviceHeartbeat";

import {

    serviceHealth,

} from "./serviceHealth";





/*
==========================================================
Discovery
==========================================================
*/

export class ServiceDiscovery {

    /*
    ======================================================
    Resolve
    ======================================================
    */

    public resolve<T>(

        name: string,

    ): T {

        return serviceResolver.resolve<T>(

            name,

        );

    }





    /*
    ======================================================
    Exists
    ======================================================
    */

    public exists(

        name: string,

    ): boolean {

        return discoveryRegistry.has(

            name,

        );

    }





    /*
    ======================================================
    Services
    ======================================================
    */

    public services():

        string[] {

        return discoveryRegistry.names();

    }





    /*
    ======================================================
    Heartbeat
    ======================================================
    */

    public heartbeat(

        name: string,

    ): void {

        serviceHeartbeat.beat(

            name,

        );

    }





    /*
    ======================================================
    Health
    ======================================================
    */

    public async health(

        name: string,

    ) {

        return serviceHealth.get(

            name,

        );

    }





    /*
    ======================================================
    Summary
    ======================================================
    */

    public summary() {

        logger.debug(

            "Building discovery summary.",

        );



        return {

            services:

                this.services(),

            count:

                discoveryRegistry.count(),

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const serviceDiscovery =

    new ServiceDiscovery();

