/**
==========================================================
AURA Trade OS
Discovery Service Registry
Version : 0.3.0 Alpha
==========================================================
Read-only Service Registry Adapter
==========================================================
*/

import {

    dependencyContainer,

} from "@/services/bootstrap/dependencyContainer";





/*
==========================================================
Discovery Registry
==========================================================
*/

export class DiscoveryServiceRegistry {

    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        name: string,

    ): unknown {

        if (!dependencyContainer.has(name)) {

            return undefined;

        }

        return dependencyContainer.resolve(

            name,

        );

    }





    /*
    ======================================================
    Has
    ======================================================
    */

    public has(

        name: string,

    ): boolean {

        return dependencyContainer.has(

            name,

        );

    }





    /*
    ======================================================
    Names
    ======================================================
    */

    public names():

        string[] {

        return dependencyContainer.list();

    }





    /*
    ======================================================
    Count
    ======================================================
    */

    public count():

        number {

        return this.names().length;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const discoveryRegistry =

    new DiscoveryServiceRegistry();

