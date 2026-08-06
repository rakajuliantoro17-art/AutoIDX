/**
==========================================================
AURA Trade OS
Configuration Watcher
Version : 0.3.0 Alpha
==========================================================
Configuration Watcher
==========================================================
*/

import { logger } from "@/services/logger";
import { configManager } from "./configManager";





/*
==========================================================
Types
==========================================================
*/

export type ConfigWatcherCallback =

    () => void;





/*
==========================================================
Configuration Watcher
==========================================================
*/

export class ConfigWatcher {

    private watching = false;

    private readonly listeners =

        new Set<

            ConfigWatcherCallback

        >();





    /*
    ======================================================
    Start
    ======================================================
    */

    public start(): void {

        if (

            this.watching

        ) {

            return;

        }



        this.watching = true;



        logger.info(

            "Configuration watcher started.",

        );

    }





    /*
    ======================================================
    Stop
    ======================================================
    */

    public stop(): void {

        this.watching = false;



        logger.info(

            "Configuration watcher stopped.",

        );

    }





    /*
    ======================================================
    Reload
    ======================================================
    */

    public reload(): void {

        configManager.reload();



        this.listeners.forEach(

            (

                listener,

            ) => listener(),

        );



        logger.info(

            "Configuration reloaded.",

        );

    }





    /*
    ======================================================
    Subscribe
    ======================================================
    */

    public subscribe(

        listener:

            ConfigWatcherCallback,

    ): void {

        this.listeners.add(

            listener,

        );

    }





    /*
    ======================================================
    Unsubscribe
    ======================================================
    */

    public unsubscribe(

        listener:

            ConfigWatcherCallback,

    ): void {

        this.listeners.delete(

            listener,

        );

    }





    /*
    ======================================================
    Status
    ======================================================
    */

    public isWatching():

        boolean {

        return this.watching;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const configWatcher =

    new ConfigWatcher();
```

