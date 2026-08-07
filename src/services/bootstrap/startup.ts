/**
==========================================================
AURA Trade OS
Startup
Version : 0.2.0 Alpha
==========================================================
Application Startup Entry Point
==========================================================
*/

import logger from "@/services/logger";

import {

    bootstrap,

} from "./bootstrap";

import {

    lifecycle,

} from "./lifecycle";





/*
==========================================================
Startup
==========================================================
*/

export async function startup(): Promise<void> {

    logger.info(

        "========================================",

    );



    logger.info(

        "Starting AURA Trade OS...",

    );



    logger.info(

        "========================================",

    );



    try {

        lifecycle.start();



        await bootstrap.initialize();



        logger.info(

            "Startup completed successfully.",

        );

    }

    catch (error) {

        logger.error(

            "Startup failed.",

            error,

        );



        throw error;

    }

}





/*
==========================================================
Shutdown
==========================================================
*/

export async function shutdown(): Promise<void> {

    logger.info(

        "Shutdown requested.",

    );



    try {

        lifecycle.stop();



        await bootstrap.shutdown();



        logger.info(

            "Shutdown completed.",

        );

    }

    catch (error) {

        logger.error(

            "Shutdown failed.",

            error,

        );



        throw error;

    }

}





/*
==========================================================
Restart
==========================================================
*/

export async function restart(): Promise<void> {

    logger.info(

        "Restart requested.",

    );



    lifecycle.restart();



    await bootstrap.restart();

}





/*
==========================================================
Maintenance
==========================================================
*/

export async function maintenance(): Promise<void> {

    logger.info(

        "Maintenance mode enabled.",

    );



    lifecycle.maintenance();

}





/*
==========================================================
Resume
==========================================================
*/

export async function resume(): Promise<void> {

    logger.info(

        "Leaving maintenance mode.",

    );



    lifecycle.resume();

}

