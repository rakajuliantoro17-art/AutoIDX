/**
==========================================================
AURA Trade OS
Service Resolver
Version : 0.3.0 Alpha
==========================================================
Service Discovery Resolver
==========================================================
*/

import { logger } from "@/services/logger";
import {
    serviceRegistry,
} from "@/services/bootstrap/serviceRegistry";





/*
==========================================================
Service Resolver
==========================================================
*/

export class ServiceResolver {

    /*
    ======================================================
    Resolve
    ======================================================
    */

    public resolve<T>(

        name: string,

    ): T {

        const service =

            serviceRegistry.get(

                name,

            );



        if (!service) {

            throw new Error(

                `Service "${name}" is not registered.`,

            );

        }



        logger.debug(

            `Resolved service: ${name}`,

        );



        return service as T;

    }





    /*
    ======================================================
    Try Resolve
    ======================================================
    */

    public tryResolve<T>(

        name: string,

    ): T | undefined {

        const service =

            serviceRegistry.get(

                name,

            );



        if (!service) {

            return undefined;

        }



        return service as T;

    }





    /*
    ======================================================
    Exists
    ======================================================
    */

    public exists(

        name: string,

    ): boolean {

        return (

            serviceRegistry.get(

                name,

            ) !== undefined

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const serviceResolver =

    new ServiceResolver();

