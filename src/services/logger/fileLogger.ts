```typescript
/**
==========================================================
AURA Trade OS
File Logger
Version : 0.1.0 Alpha
==========================================================
Node.js File Logger
==========================================================
*/

import fs from "node:fs";

import path from "node:path";

import {

    LogContext,

    LogLevel,

} from "./consoleLogger";





/*
==========================================================
File Logger
==========================================================
*/

export class FileLogger {

    private readonly directory: string;

    private readonly filename: string;



    constructor(

        directory = "logs",

        filename = "aura.log",

    ) {

        this.directory = path.resolve(directory);

        this.filename = filename;

        if (

            !fs.existsSync(this.directory)

        ) {

            fs.mkdirSync(

                this.directory,

                {

                    recursive: true,

                },

            );

        }

    }





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
    File
    ======================================================
    */

    private file(): string {

        return path.join(

            this.directory,

            this.filename,

        );

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

        const payload =

            context

                ? ` ${JSON.stringify(context)}`

                : "";

        return `[${this.timestamp()}] [${level.toUpperCase()}] ${message}${payload}\n`;

    }





    /*
    ======================================================
    Write
    ======================================================
    */

    private write(

        level: LogLevel,

        message: string,

        context?: LogContext,

    ): void {

        fs.appendFileSync(

            this.file(),

            this.format(

                level,

                message,

                context,

            ),

            "utf8",

        );

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

        this.write(

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

    ): void {

        this.write(

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

    ): void {

        this.write(

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

    ): void {

        this.write(

            "error",

            message,

            {

                ...context,

                error,

            },

        );

    }





    /*
    ======================================================
    Read
    ======================================================
    */

    public read(): string {

        if (

            !fs.existsSync(

                this.file(),

            )

        ) {

            return "";

        }

        return fs.readFileSync(

            this.file(),

            "utf8",

        );

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        fs.writeFileSync(

            this.file(),

            "",

            "utf8",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const fileLogger =

    new FileLogger();
```

