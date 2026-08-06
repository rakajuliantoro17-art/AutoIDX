/**
==========================================================
AURA Trade OS
Configuration Validator
Version : 0.3.0 Alpha
==========================================================
Configuration Validator
==========================================================
*/

import { logger } from "@/services/logger";

import type {

    Configuration,

} from "./configLoader";

import {

    configSchema,

} from "./configSchema";





/*
==========================================================
Configuration Validator
==========================================================
*/

export class ConfigValidator {

    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(

        configuration:

            Configuration,

    ): void {

        for (

            const [

                key,

                schema,

            ] of Object.entries(

                configSchema,

            )

        ) {

            const value =

                configuration[

                    key as keyof Configuration

                ];



            if (

                schema.required &&

                (

                    value ===

                        undefined ||

                    value ===

                        null

                )

            ) {

                throw new Error(

                    `Missing required configuration: ${key}`,

                );

            }



            if (

                value !==

                    undefined &&

                value !==

                    null

            ) {

                const actualType =

                    typeof value;



                if (

                    actualType !==

                    schema.type

                ) {

                    throw new Error(

                        `Invalid type for "${key}". Expected ${schema.type}, received ${actualType}.`,

                    );

                }

            }

        }



        logger.info(

            "Configuration validation passed.",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const configValidator =

    new ConfigValidator();

