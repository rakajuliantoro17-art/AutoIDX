/**
==========================================================
AURA Trade OS
Configuration Manager
Version : 0.3.0 Alpha
==========================================================
Global Configuration Manager
==========================================================
*/

import {

    Configuration,

    configLoader,

} from "./configLoader";

import {

    configValidator,

} from "./configValidator";

import { logger } from "@/services/logger";





/*
==========================================================
Configuration Manager
==========================================================
*/

export class ConfigManager {

    private configuration?:

        Configuration;





    /*
    ======================================================
    Initialize
    ======================================================
    */

    public initialize(): void {

        const configuration =

            configLoader.load(

                "environment",

            );



        configValidator.validate(

            configuration,

        );



        this.configuration =

            configuration;



        logger.info(

            "Configuration initialized.",

        );

    }





    /*
    ======================================================
    Get All
    ======================================================
    */

    public getConfiguration():

        Configuration {

        this.ensureInitialized();



        return {

            ...this.configuration!,

        };

    }





    /*
    ======================================================
    Get Value
    ======================================================
    */

    public get<

        K extends keyof Configuration

    >(

        key: K,

    ): Configuration[K] {

        this.ensureInitialized();



        return this.configuration![

            key

        ];

    }





    /*
    ======================================================
    Has
    ======================================================
    */

    public has(

        key:

            keyof Configuration,

    ): boolean {

        this.ensureInitialized();



        return (

            this.configuration![

                key

            ] !== undefined

        );

    }





    /*
    ======================================================
    Reload
    ======================================================
    */

    public reload(): void {

        logger.info(

            "Reloading configuration.",

        );



        this.initialize();

    }





    /*
    ======================================================
    Initialized
    ======================================================
    */

    public isInitialized():

        boolean {

        return (

            this.configuration !==

            undefined

        );

    }





    /*
    ======================================================
    Ensure
    ======================================================
    */

    private ensureInitialized():

        void {

        if (

            !this.configuration

        ) {

            throw new Error(

                "Configuration has not been initialized.",

            );

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const configManager =

    new ConfigManager();
```

