```typescript
/**
==========================================================
AURA Trade OS
Unified Logger
Version : 0.1.0 Alpha
==========================================================
Facade Logger
==========================================================
*/

import {

    consoleLogger,

    LogContext,

} from "./consoleLogger";

import {

    fileLogger,

} from "./fileLogger";





/*
==========================================================
Configuration
==========================================================
*/

export interface LoggerConfig {

    enableConsole: boolean;

    enableFile: boolean;

}





/*
==========================================================
Logger
==========================================================
*/

export class Logger {

    private config: LoggerConfig = {

        enableConsole: true,

        enableFile:

            process.env.NODE_ENV !== "production",

    };





    /*
    ======================================================
    Configure
    ======================================================
    */

    public configure(

        config: Partial<LoggerConfig>,

    ): void {

        this.config = {

            ...this.config,

            ...config,

        };

    }





    /*
    ======================================================
    Debug
    ======================================================
    */

    public debug(

        message: string,

        context?: LogContext,

    ): void {

        if (

            this.config.enableConsole

        ) {

            consoleLogger.debug(

                message,

                context,

            );

        }

        if (

            this.config.enableFile

        ) {

            fileLogger.debug(

                message,

                context,

            );

        }

    }





    /*
    ======================================================
    Info
    ======================================================
    */

    public info(

        message: string,

        context?: LogContext,

    ): void {

        if (

            this.config.enableConsole

        ) {

            consoleLogger.info(

                message,

                context,

            );

        }

        if (

            this.config.enableFile

        ) {

            fileLogger.info(

                message,

                context,

            );

        }

    }





    /*
    ======================================================
    Warning
    ======================================================
    */

    public warn(

        message: string,

        context?: LogContext,

    ): void {

        if (

            this.config.enableConsole

        ) {

            consoleLogger.warn(

                message,

                context,

            );

        }

        if (

            this.config.enableFile

        ) {

            fileLogger.warn(

                message,

                context,

            );

        }

    }





    /*
    ======================================================
    Error
    ======================================================
    */

    public error(

        message: string,

        error?: unknown,

        context?: LogContext,

    ): void {

        if (

            this.config.enableConsole

        ) {

            consoleLogger.error(

                message,

                error,

                context,

            );

        }

        if (

            this.config.enableFile

        ) {

            fileLogger.error(

                message,

                error,

                context,

            );

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const logger =

    new Logger();
```

