/**
==========================================================
AURA Trade OS
Log Rotation Service
Version : 0.1.0 Alpha
==========================================================
Automatically rotate log files when they exceed
the configured size.
==========================================================
*/

import fs from "node:fs";

import path from "node:path";





/*
==========================================================
Configuration
==========================================================
*/

export interface LogRotationOptions {

    directory?: string;

    filename?: string;

    maxFileSizeMB?: number;

    maxBackupFiles?: number;

}





/*
==========================================================
Log Rotation
==========================================================
*/

export class LogRotation {

    private readonly directory: string;

    private readonly filename: string;

    private readonly maxSize: number;

    private readonly maxBackups: number;



    constructor(

        options: LogRotationOptions = {},

    ) {

        this.directory =

            path.resolve(

                options.directory ?? "logs",

            );

        this.filename =

            options.filename ?? "aura.log";

        this.maxSize =

            (options.maxFileSizeMB ?? 50)

            * 1024

            * 1024;

        this.maxBackups =

            options.maxBackupFiles ?? 10;

        this.ensureDirectory();

    }





    /*
    ======================================================
    Directory
    ======================================================
    */

    private ensureDirectory(): void {

        if (

            !fs.existsSync(

                this.directory,

            )

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
    File
    ======================================================
    */

    public getLogFile(): string {

        return path.join(

            this.directory,

            this.filename,

        );

    }





    /*
    ======================================================
    Rotate
    ======================================================
    */

    public rotate(): boolean {

        const file =

            this.getLogFile();

        if (

            !fs.existsSync(file)

        ) {

            return false;

        }

        const stat =

            fs.statSync(file);

        if (

            stat.size < this.maxSize

        ) {

            return false;

        }

        const ext =

            path.extname(this.filename);

        const name =

            path.basename(

                this.filename,

                ext,

            );

        const timestamp =

            new Date()

                .toISOString()

                .replace(/[:.]/g, "-");

        const archive =

            path.join(

                this.directory,

                `${name}-${timestamp}${ext}`,

            );

        fs.renameSync(

            file,

            archive,

        );

        fs.writeFileSync(

            file,

            "",

            "utf8",

        );

        this.cleanup();

        return true;

    }





    /*
    ======================================================
    Cleanup
    ======================================================
    */

    public cleanup(): void {

        const ext =

            path.extname(

                this.filename,

            );

        const name =

            path.basename(

                this.filename,

                ext,

            );

        const backups =

            fs.readdirSync(

                this.directory,

            )

            .filter(

                file =>

                    file.startsWith(

                        `${name}-`,

                    ) &&

                    file.endsWith(

                        ext,

                    ),

            )

            .map(

                file => ({

                    file,

                    time:

                        fs.statSync(

                            path.join(

                                this.directory,

                                file,

                            ),

                        ).mtimeMs,

                }),

            )

            .sort(

                (a, b) =>

                    b.time - a.time,

            );

        const expired =

            backups.slice(

                this.maxBackups,

            );

        for (

            const backup of expired

        ) {

            fs.unlinkSync(

                path.join(

                    this.directory,

                    backup.file,

                ),

            );

        }

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public stats() {

        const file =

            this.getLogFile();

        if (

            !fs.existsSync(file)

        ) {

            return {

                exists: false,

                size: 0,

            };

        }

        const stat =

            fs.statSync(file);

        return {

            exists: true,

            size: stat.size,

            sizeMB:

                Number(

                    (

                        stat.size /

                        1024 /

                        1024

                    ).toFixed(2),

                ),

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const logRotation =

    new LogRotation();
