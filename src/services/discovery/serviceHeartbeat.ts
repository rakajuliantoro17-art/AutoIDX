/**
==========================================================
AURA Trade OS
Service Heartbeat
Version : 0.3.0 Alpha
==========================================================
Service Heartbeat Manager
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface ServiceHeartbeatRecord {

    service: string;

    timestamp: Date;

}





/*
==========================================================
Heartbeat
==========================================================
*/

export class ServiceHeartbeat {

    private readonly records =

        new Map<

            string,

            Date

        >();





    /*
    ======================================================
    Beat
    ======================================================
    */

    public beat(

        service: string,

    ): void {

        const now =

            new Date();



        this.records.set(

            service,

            now,

        );



        logger.debug(

            `Heartbeat: ${service}`,

        );

    }





    /*
    ======================================================
    Last Beat
    ======================================================
    */

    public lastBeat(

        service: string,

    ): Date | undefined {

        return this.records.get(

            service,

        );

    }





    /*
    ======================================================
    Alive
    ======================================================
    */

    public isAlive(

        service: string,

        timeoutMs = 30000,

    ): boolean {

        const last =

            this.records.get(

                service,

            );



        if (!last) {

            return false;

        }



        return (

            Date.now() -

            last.getTime()

        ) < timeoutMs;

    }





    /*
    ======================================================
    Records
    ======================================================
    */

    public getAll():

        readonly ServiceHeartbeatRecord[] {

        return Array.from(

            this.records.entries(),

        ).map(

            ([

                service,

                timestamp,

            ]) => ({

                service,

                timestamp,

            }),

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const serviceHeartbeat =

    new ServiceHeartbeat();

