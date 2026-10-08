/**
==========================================================
AURA Trade OS
Plugin Manager
Version : 0.3.0 Alpha
==========================================================
Plugin Lifecycle Manager
==========================================================
*/

import { pluginRegistry } from "./pluginRegistry";
import { pluginValidator } from "./pluginValidator";
import { pluginLoader } from "./pluginLoader";

import type {

    Plugin,

} from "./plugin";





/*
==========================================================
Plugin Manager
==========================================================
*/

export class PluginManager {

    /*
    ======================================================
    Install
    ======================================================
    */

    public async install(

        plugin: Plugin,

    ): Promise<void> {

        const validation =

            pluginValidator.validate(

                plugin,

            );



        if (!validation.valid) {

            throw new Error(

                validation.errors.join(

                    ", ",

                ),

            );

        }



        pluginRegistry.register(

            plugin,

        );

    }





    /*
    ======================================================
    Uninstall
    ======================================================
    */

    public uninstall(

        id: string,

    ): void {

        pluginRegistry.remove(

            id,

        );

    }





    /*
    ======================================================
    Start
    ======================================================
    */

    public async start(

        id: string,

    ): Promise<void> {

        const plugin =

            pluginRegistry.get(

                id,

            );



        if (!plugin) {

            return;

        }



        await pluginLoader.load(

            plugin,

        );



        await plugin.start();

    }





    /*
    ======================================================
    Stop
    ======================================================
    */

    public async stop(

        id: string,

    ): Promise<void> {

        const plugin =

            pluginRegistry.get(

                id,

            );



        if (!plugin) {

            return;

        }



        await plugin.stop();

    }





    /*
    ======================================================
    Reload
    ======================================================
    */

    public async reload(

        id: string,

    ): Promise<void> {

        await this.stop(

            id,

        );



        await this.start(

            id,

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const pluginManager =

    new PluginManager();


