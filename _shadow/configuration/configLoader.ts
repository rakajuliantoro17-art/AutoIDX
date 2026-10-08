/**
==========================================================
AURA Trade OS
Configuration Loader
Version : 0.3.0 Alpha
==========================================================
Configuration Source Loader
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type ConfigSource =

    | "environment"

    | "object";





export interface Configuration {

    appName: string;

    environment: string;

    version: string;

    apiSecret?: string;

    exchange?: string;

}





/*
==========================================================
Configuration Loader
==========================================================
*/

export class ConfigLoader {

    /*
    ======================================================
    Environment
    ======================================================
    */

    public loadEnvironment():

        Configuration {

        logger.info(

            "Loading configuration from environment.",

        );



        return {

            appName:

                process.env.APP_NAME ??

                "AURA Trade OS",

            environment:

                process.env.NODE_ENV ??

                "development",

            version:

                process.env.APP_VERSION ??

                "0.3.0",

            apiSecret:

                process.env.API_SECRET,

            exchange:

                process.env.EXCHANGE,

        };

    }





    /*
    ======================================================
    Object
    ======================================================
    */

    public loadObject(

        configuration:

            Configuration,

    ): Configuration {

        logger.info(

            "Loading configuration from object.",

        );



        return {

            ...configuration,

        };

    }





    /*
    ======================================================
    Generic
    ======================================================
    */

    public load(

        source:

            ConfigSource,

        configuration?:

            Configuration,

    ): Configuration {

        switch (source) {

            case "environment":

                return this.loadEnvironment();



            case "object":

                if (!configuration) {

                    throw new Error(

                        "Configuration object is required.",

                    );

                }



                return this.loadObject(

                    configuration,

                );



            default:

                throw new Error(

                    "Unsupported configuration source.",

                );

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const configLoader =

    new ConfigLoader();

