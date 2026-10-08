/**
==========================================================
AURA Trade OS
Version
Version : 0.2.0 Alpha
==========================================================
Application Version Information
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Release Stage
==========================================================
*/

export enum ReleaseStage {

    ALPHA = "Alpha",

    BETA = "Beta",

    RC = "Release Candidate",

    STABLE = "Stable",

}





/*
==========================================================
Version Information
==========================================================
*/

export interface VersionInformation {

    major: number;

    minor: number;

    patch: number;

    stage: ReleaseStage;

    build: number;

    releasedAt: string;

}





/*
==========================================================
Version Service
==========================================================
*/

export class VersionService {

    private readonly version:

        VersionInformation = {

        major: 0,

        minor: 2,

        patch: 0,

        stage:

            ReleaseStage.ALPHA,

        build: 1,

        releasedAt:

            "2026-08-05",

    };





    /*
    ======================================================
    Information
    ======================================================
    */

    public get():

        Readonly<VersionInformation> {

        return this.version;

    }





    /*
    ======================================================
    Semantic Version
    ======================================================
    */

    public getSemanticVersion(): string {

        return (

            `${this.version.major}.` +

            `${this.version.minor}.` +

            `${this.version.patch}`

        );

    }





    /*
    ======================================================
    Full Version
    ======================================================
    */

    public getFullVersion(): string {

        return (

            `${this.getSemanticVersion()} ` +

            `${this.version.stage}`

        );

    }





    /*
    ======================================================
    Build
    ======================================================
    */

    public getBuild(): number {

        return this.version.build;

    }





    /*
    ======================================================
    Stage
    ======================================================
    */

    public getStage():

        ReleaseStage {

        return this.version.stage;

    }





    /*
    ======================================================
    Release Date
    ======================================================
    */

    public getReleaseDate(): string {

        return this.version.releasedAt;

    }





    /*
    ======================================================
    JSON
    ======================================================
    */

    public toJSON():

        VersionInformation {

        return {

            ...this.version,

        };

    }





    /*
    ======================================================
    Print
    ======================================================
    */

    public print(): void {

        logger.info(

            "========================================",

        );



        logger.info(

            `AURA Trade OS ${this.getFullVersion()}`,

        );



        logger.info(

            `Build : ${this.version.build}`,

        );



        logger.info(

            `Released : ${this.version.releasedAt}`,

        );



        logger.info(

            "========================================",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const version =

    new VersionService();

