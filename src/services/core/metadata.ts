/**
==========================================================
AURA Trade OS
Metadata
Version : 0.2.0 Alpha
==========================================================
Application Metadata
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Application Metadata
==========================================================
*/

export interface ApplicationMetadata {

    name: string;

    version: string;

    stage: string;

    description: string;

    author: string;

    organization: string;

    license: string;

    repository: string;

    homepage: string;

    node: string;

    platform: string;

    architecture: string;

}





/*
==========================================================
Metadata Service
==========================================================
*/

export class MetadataService {

    private readonly metadata:

        ApplicationMetadata = {

        name:

            "AURA Trade OS",

        version:

            "0.2.0 Alpha",

        stage:

            "Phase 20",

        description:

            "Enterprise Algorithmic Trading Platform",

        author:

            "Raka Aditya Juliantoro",

        organization:

            "AURA Labs",

        license:

            "MIT",

        repository:

            "https://github.com/rakajuliantoro17-art/AutoIDX",

        homepage:

            "https://auratrade.vercel.app",

        node:

            process.version,

        platform:

            process.platform,

        architecture:

            process.arch,

    };





    /*
    ======================================================
    Metadata
    ======================================================
    */

    public get():

        Readonly<ApplicationMetadata> {

        return this.metadata;

    }





    /*
    ======================================================
    Version
    ======================================================
    */

    public getVersion(): string {

        return this.metadata.version;

    }





    /*
    ======================================================
    Name
    ======================================================
    */

    public getName(): string {

        return this.metadata.name;

    }





    /*
    ======================================================
    Stage
    ======================================================
    */

    public getStage(): string {

        return this.metadata.stage;

    }





    /*
    ======================================================
    Runtime
    ======================================================
    */

    public getRuntime() {

        return {

            node:

                this.metadata.node,

            platform:

                this.metadata.platform,

            architecture:

                this.metadata.architecture,

        };

    }





    /*
    ======================================================
    Banner
    ======================================================
    */

    public printBanner(): void {

        logger.info(

            "========================================",

        );



        logger.info(

            `${this.metadata.name}`,

        );



        logger.info(

            `Version : ${this.metadata.version}`,

        );



        logger.info(

            `${this.metadata.description}`,

        );



        logger.info(

            "========================================",

        );

    }





    /*
    ======================================================
    JSON
    ======================================================
    */

    public toJSON():

        ApplicationMetadata {

        return {

            ...this.metadata,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const metadata =

    new MetadataService();

