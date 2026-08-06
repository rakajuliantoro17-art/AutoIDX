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

    serviceRegistry as bootstrapRegistry,

} from "@/services/bootstrap/serviceRegistry";





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

        return bootstrapRegistry.get(

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

        return (

            bootstrapRegistry.get(

                name,

            ) !== undefined

        );

    }





    /*
    ======================================================
    Names
    ======================================================
    */

    public names():

        string[] {

        return

            bootstrapRegistry.names();

    }





    /*
    ======================================================
    Count
    ======================================================
    */

    public count():

        number {

        return

            this.names().length;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const discoveryRegistry =

    new DiscoveryServiceRegistry();
```

