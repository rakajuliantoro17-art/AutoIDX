```typescript
/**
==========================================================
AURA Trade OS
Log Rotation
Version : 0.1.0 Alpha
==========================================================
Log Rotation Service
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

    maxFileSizeMB?: number;

    maxBackupFiles?: number;

}





/*
==========================================================
Log Rotation
==========================================================
*/

export class LogRotation {

    private readonly maxSize: number;

    private readonly maxBackups: number;



    constructor(

        options: LogRotationOptions = {},

    ) {

        this.maxSize =

            (options.maxFileSizeMB ?? 50)

            * 1024

            * 1024;

        this.maxBackups =

            options.maxBackupFiles ?? 10;

    }





    /*
    ======================================================
    Rotate
    ======================================================
    */

    public rotate(

        filePath: string,

    ): boolean {

        if (

            !fs.existsSync(filePath)

        ) {

            return false;

        }

        const stat =

            fs.statSync(filePath);

        if (

            stat.size < this.maxSize

        ) {

            return false;

        }

        const directory =

            path.dirname(filePath);

        const extension =

            path.extname(filePath);

        const filename =

            path.basename(

                filePath,

                extension,

            );

        const timestamp =

            new Date()

                .toISOString()

                .replace(/[:.]/g, "-");

        const archive =

            path.join(

                directory,

                `${filename}-${timestamp}${extension}`,

            );

        fs.renameSync(

            filePath,

            archive,

        );

        fs.writeFileSync(

            filePath,

            "",

            "utf8",

        );

        this.cleanup(

            directory,

            filename,

            extension,

        );

        return true;

    }





    /*
    ======================================================
    Cleanup
    ======================================================
    */

    private cleanup(

        directory: string,

        filename: string,

        extension: string,

    ): void {

        const backups =

            fs.readdirSync(directory)

                .filter(

                    file =>

                        file.startsWith(

                            `${filename}-`

                        ) &&

                        file.endsWith(

                            extension,

                        ),

                )

                .map(

                    file => ({

                        file,

                        time:

                            fs.statSync(

                                path.join(

                                    directory,

                                    file,

                                ),

                            ).mtime.getTime(),

                    }),

                )

                .sort(

                    (a, b) =>

                        b.time - a.time,

                );

        if (

            backups.length <=

            this.maxBackups

        ) {

            return;

        }

        for (

            const backup of backups.slice(

                this.maxBackups,

            )

        ) {

            fs.unlinkSync(

                path.join(

                    directory,

                    backup.file,

                ),

            );

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const logRotation =

    new LogRotation();
```
