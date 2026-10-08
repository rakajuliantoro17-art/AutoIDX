/**
==========================================================
AURA Trade OS
Feature Flags
Version : 0.3.0 Alpha
==========================================================
Feature Flag Manager
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type FeatureFlag =

    | "analytics"

    | "cache"

    | "exchange"

    | "metrics"

    | "scheduler"

    | "telemetry"

    | "trading";





/*
==========================================================
Feature Flag Manager
==========================================================
*/

export class FeatureFlags {

    private readonly flags =

        new Map<

            FeatureFlag,

            boolean

        >([

            [

                "analytics",

                true,

            ],

            [

                "cache",

                true,

            ],

            [

                "exchange",

                true,

            ],

            [

                "metrics",

                true,

            ],

            [

                "scheduler",

                true,

            ],

            [

                "telemetry",

                false,

            ],

            [

                "trading",

                true,

            ],

        ]);





    /*
    ======================================================
    Enabled
    ======================================================
    */

    public isEnabled(

        flag:

            FeatureFlag,

    ): boolean {

        return (

            this.flags.get(

                flag,

            ) ?? false

        );

    }





    /*
    ======================================================
    Enable
    ======================================================
    */

    public enable(

        flag:

            FeatureFlag,

    ): void {

        this.flags.set(

            flag,

            true,

        );



        logger.info(

            `Feature enabled: ${flag}`,

        );

    }





    /*
    ======================================================
    Disable
    ======================================================
    */

    public disable(

        flag:

            FeatureFlag,

    ): void {

        this.flags.set(

            flag,

            false,

        );



        logger.info(

            `Feature disabled: ${flag}`,

        );

    }





    /*
    ======================================================
    Toggle
    ======================================================
    */

    public toggle(

        flag:

            FeatureFlag,

    ): void {

        this.flags.set(

            flag,

            !this.isEnabled(

                flag,

            ),

        );

    }





    /*
    ======================================================
    Get All
    ======================================================
    */

    public getAll():

        Record<string, boolean> {

        return Object.fromEntries(

            this.flags,

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const featureFlags =

    new FeatureFlags();

