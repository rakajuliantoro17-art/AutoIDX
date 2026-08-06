/**
==========================================================
AURA Trade OS
Remote Logger
Version : 0.1.0 Alpha
==========================================================
Remote Logging Service
==========================================================
*/

import {

    LogContext,

    LogLevel,

} from "./consoleLogger";



/*
==========================================================
Types
==========================================================
*/

export interface RemoteLogEntry {

    timestamp: number;

    level: LogLevel;

    message: string;

    context?: LogContext;

}



export interface RemoteLoggerAdapter {

    send(

        log: RemoteLogEntry,

    ): Promise<void>;

}





/*
==========================================================
Remote Logger
==========================================================
*/

export class RemoteLogger {

    private adapter?: RemoteLoggerAdapter;





    /*
    ======================================================
    Adapter
    ======================================================
    */

    public setAdapter(

        adapter: RemoteLoggerAdapter,

    ): void {

        this.adapter = adapter;

    }





    /*
    ======================================================
    Enabled
    ======================================================
    */

    public enabled(): boolean {

        return this.adapter !== undefined;

    }





    /*
    ======================================================
    Send
    ======================================================
    */

    private async send(

        level: LogLevel,

        message: string,

        context?: LogContext,

    ): Promise<void> {

        if (

            !this.adapter

        ) {

            return;

        }

        await this.adapter.send({

            timestamp: Date.now(),

            level,

            message,

            context,

        });

    }





    /*
    ======================================================
    Debug
    ======================================================
    */

    public debug(

        message: string,

        context?: LogContext,

    ): Promise<void> {

        return this.send(

            "debug",

            message,

            context,

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

    ): Promise<void> {

        return this.send(

            "info",

            message,

            context,

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

    ): Promise<void> {

        return this.send(

            "warn",

            message,

            context,

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

    ): Promise<void> {

        return this.send(

            "error",

            message,

            {

                ...context,

                error,

            },

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const remoteLogger =

    new RemoteLogger();

