/**
==========================================================
AURA Trade OS
Plugin Loader
Version : 0.3.0 Alpha
==========================================================
Plugin Loading Engine
==========================================================
*/

import type {

    Plugin,

} from "./plugin";





/*
==========================================================
Plugin Loader
==========================================================
*/

export class PluginLoader {

    private readonly loaded =

        new Map<string, Plugin>();





    /*
    ======================================================
    Load
    ======================================================
    */

    public async load(

        plugin: Plugin,

    ): Promise<Plugin> {

        if (

            this.loaded.has(

                plugin.manifest.id,

            )

        ) {

            return this.loaded.get(

                plugin.manifest.id,

            )!;

        }



        await plugin.initialize();



        this.loaded.set(

            plugin.manifest.id,

            plugin,

        );



        return plugin;

    }





    /*
    ======================================================
    Unload
    ======================================================
    */

    public async unload(

        id: string,

    ): Promise<void> {

        const plugin =

            this.loaded.get(

                id,

            );



        if (!plugin) {

            return;

        }



        await plugin.dispose();



        this.loaded.delete(

            id,

        );

    }





    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        id: string,

    ): Plugin | undefined {

        return this.loaded.get(

            id,

        );

    }





    /*
    ======================================================
    Loaded
    ======================================================
    */

    public list():

        Plugin[] {

        return [

            ...this.loaded.values(),

        ];

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const pluginLoader =

    new PluginLoader();

