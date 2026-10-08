/**
==========================================================
AURA Trade OS
Health
Version : 0.2.0 Alpha
==========================================================
Core Health Status
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Health Status
==========================================================
*/

export enum HealthStatus {

    HEALTHY = "HEALTHY",

    DEGRADED = "DEGRADED",

    UNHEALTHY = "UNHEALTHY",

}





/*
==========================================================
Health Information
==========================================================
*/

export interface HealthInformation {

    status: HealthStatus;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Core Health
==========================================================
*/

export class CoreHealth {

    private status =

        HealthStatus.HEALTHY;



    private message =

        "System operating normally.";



    private checkedAt =

        new Date();





    /*
    ======================================================
    Healthy
    ======================================================
    */

    public healthy(

        message =

            "System operating normally.",

    ): void {

        this.update(

            HealthStatus.HEALTHY,

            message,

        );

    }





    /*
    ======================================================
    Degraded
    ======================================================
    */

    public degraded(

        message: string,

    ): void {

        this.update(

            HealthStatus.DEGRADED,

            message,

        );

    }





    /*
    ======================================================
    Unhealthy
    ======================================================
    */

    public unhealthy(

        message: string,

    ): void {

        this.update(

            HealthStatus.UNHEALTHY,

            message,

        );

    }





    /*
    ======================================================
    Update
    ======================================================
    */

    private update(

        status: HealthStatus,

        message: string,

    ): void {

        this.status = status;

        this.message = message;

        this.checkedAt =

            new Date();



        logger.info(

            `Health changed to ${status}: ${message}`,

        );

    }





    /*
    ======================================================
    Status
    ======================================================
    */

    public getStatus():

        HealthStatus {

        return this.status;

    }





    /*
    ======================================================
    Healthy?
    ======================================================
    */

    public isHealthy(): boolean {

        return (

            this.status ===

            HealthStatus.HEALTHY

        );

    }





    /*
    ======================================================
    Degraded?
    ======================================================
    */

    public isDegraded(): boolean {

        return (

            this.status ===

            HealthStatus.DEGRADED

        );

    }





    /*
    ======================================================
    Unhealthy?
    ======================================================
    */

    public isUnhealthy(): boolean {

        return (

            this.status ===

            HealthStatus.UNHEALTHY

        );

    }





    /*
    ======================================================
    Information
    ======================================================
    */

    public getInformation():

        HealthInformation {

        return {

            status:

                this.status,

            message:

                this.message,

            checkedAt:

                this.checkedAt,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const health =

    new CoreHealth();

