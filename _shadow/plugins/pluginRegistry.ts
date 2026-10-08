/**
==========================================================
AURA Trade OS
Plugin Registry
Version : 0.3.0 Alpha
==========================================================
Plugin Registry
==========================================================
*/

import type {

    Plugin,

} from "./plugin";





/*
==========================================================
Plugin Registry
==========================================================
*/

export class PluginRegistry {

    private readonly plugins =

        new Map<string, Plugin>();





    /*
    ======================================================
    Register
    ======================================================
    */

    public register(

        plugin: Plugin,

    ): void {

        this.plugins.set(

            plugin.id,

            plugin,

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

        return this.plugins.get(

            id,

        );

    }





    /*
    ======================================================
    Exists
    ======================================================
    */

    public has(

        id: string,

    ): boolean {

        return this.plugins.has(

            id,

        );

    }





    /*
    ======================================================
    Remove
    ======================================================
    */

    public remove(

        id: string,

    ): boolean {

        return this.plugins.delete(

            id,

        );

    }





    /*
    ======================================================
    List
    ======================================================
    */

    public list():

        Plugin[] {

        return [

            ...this.plugins.values(),

        ];

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.plugins.clear();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const pluginRegistry =

    new PluginRegistry();
