/**
==========================================================
AURA Trade OS
Version Checker
Version : 0.1.0 Alpha
==========================================================
Version Maintenance Service
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface VersionInfo {

    current: string;

    latest: string;

    updateAvailable: boolean;

    checkedAt: number;

}





/*
==========================================================
Version Checker
==========================================================
*/

export class VersionChecker {

    /*
    ======================================================
    Current Version
    ======================================================
    */

    public getCurrentVersion(): string {

        return process.env.npm_package_version ??

            "0.1.0-alpha";

    }





    /*
    ======================================================
    Latest Version
    ======================================================
    */

    public async getLatestVersion()

        : Promise<string> {

        /*
        ==================================================
        Future:

        GitHub Releases API

        https://api.github.com/repos/
        rakajuliantoro17-art/AURA/releases/latest
        ==================================================
        */

        return this.getCurrentVersion();

    }





    /*
    ======================================================
    Compare Version
    ======================================================
    */

    public async check()

        : Promise<VersionInfo> {

        const current =

            this.getCurrentVersion();

        const latest =

            await this.getLatestVersion();

        const updateAvailable =

            current !== latest;

        logger.info(

            "Version check completed.",

            {

                current,

                latest,

                updateAvailable,

            },

        );

        return {

            current,

            latest,

            updateAvailable,

            checkedAt: Date.now(),

        };

    }





    /*
    ======================================================
    Is Latest
    ======================================================
    */

    public async isLatest()

        : Promise<boolean> {

        const version =

            await this.check();

        return !version.updateAvailable;

    }





    /*
    ======================================================
    Build Information
    ======================================================
    */

    public buildInfo() {

        return {

            version:

                this.getCurrentVersion(),

            node:

                process.version,

            environment:

                process.env.NODE_ENV ??

                "development",

            platform:

                process.platform,

            architecture:

                process.arch,

            timestamp:

                Date.now(),

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const versionChecker =

    new VersionChecker();
```

