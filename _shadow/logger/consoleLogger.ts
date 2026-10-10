/**
==========================================================
AURA Trade OS
Console Logger
Version : 0.1.0 Alpha
==========================================================
Console Logging Service
==========================================================
*/


/*
==========================================================
Types
==========================================================
*/

export type LogLevel =

    | "debug"

    | "info"

    | "warn"

    | "error";



export interface LogContext {

    service?: string;

    symbol?: string;

    strategy?: string;

    orderId?: string;

    [key: string]: unknown;

}





/*
==========================================================
Console Logger
==========================================================
*/

export class ConsoleLogger {

    /*
    ======================================================
    Timestamp
    ======================================================
    */

    private timestamp(): string {

        return new Date().toISOString();

    }





    /*
    ======================================================
    Format
    ======================================================
    */

    private format(

        level: LogLevel,

        message: string,

        context?: LogContext,

    ): string {

        let output =

            `[${this.timestamp()}] ` +

            `[${level.toUpperCase()}] ` +

            message;

        if (

            context &&

            Object.keys(context).length > 0

        ) {

            output +=

                ` ${JSON.stringify(context)}`;

        }

        return output;

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

        console.debug(

            this.format(

                "debug",

                message,

                context,

            ),

        );

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

        console.info(

            this.format(

                "info",

                message,

                context,

            ),

        );

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

        console.warn(

            this.format(

                "warn",

                message,

                context,

            ),

        );

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

        const payload = {

            ...context,

            error,

        };

        console.error(

            this.format(

                "error",

                message,

                payload,

            ),

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const consoleLogger =

    new ConsoleLogger();

