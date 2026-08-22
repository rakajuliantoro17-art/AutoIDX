/**
==========================================================
AURA Trade OS
Readiness Service
Version : 0.2.0 Alpha
==========================================================
Application Readiness Probe
==========================================================
*/

import {

    databaseHealth,

} from "./checks/databaseHealth";

import {

    exchangeHealth,

} from "./checks/exchangeHealth";

import {

    firebaseHealth,

} from "./checks/firebaseHealth";

import {

    schedulerHealth,

} from "./checks/schedulerHealth";





/*
==========================================================
Types
==========================================================
*/

export interface ReadinessReport {

    ready: boolean;

    checks: {

        database: boolean;

        firebase: boolean;

        exchange: boolean;

        scheduler: boolean;

    };

    checkedAt: Date;

}





/*
==========================================================
Readiness
==========================================================
*/

export class Readiness {

    private bootstrapped =

        false;





    /*
    ======================================================
    Bootstrap
    ======================================================
    */

    public setBootstrapped(

        ready: boolean,

    ): void {

        this.bootstrapped =

            ready;

    }





    /*
    ======================================================
    Ready
    ======================================================
    */

    public async check():

        Promise<ReadinessReport> {

        const [

            database,

            firebase,

            exchange,

            scheduler,

        ] = await Promise.all([

            databaseHealth.isHealthy(),

            firebaseHealth.isHealthy(),

            exchangeHealth.isHealthy(),

            schedulerHealth.isHealthy(),

        ]);



        const ready =

            this.bootstrapped &&

            database &&

            firebase &&

            exchange &&

            scheduler;



        return {

            ready,

            checks: {

                database,

                firebase,

                exchange,

                scheduler,

            },

            checkedAt:

                new Date(),

        };

    }





    /*
    ======================================================
    Is Ready
    ======================================================
    */

    public async isReady():

        Promise<boolean> {

        return (

            await this.check()

        ).ready;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const readiness =

    new Readiness();

