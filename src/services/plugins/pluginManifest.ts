/**
==========================================================
AURA Trade OS
Plugin Manifest
Version : 0.3.0 Alpha
==========================================================
Plugin Manifest Definition
==========================================================
*/

import type {

    PluginPermission,

} from "./pluginSandbox";





/*
==========================================================
Plugin Manifest
==========================================================
*/

export interface PluginManifest {

    /*
    ======================================================
    Identity
    ======================================================
    */

    readonly id: string;

    readonly name: string;

    readonly version: string;





    /*
    ======================================================
    Information
    ======================================================
    */

    readonly description: string;

    readonly author: string;





    /*
    ======================================================
    Compatibility
    ======================================================
    */

    readonly engine: string;





    /*
    ======================================================
    Dependency
    ======================================================
    */

    readonly dependencies:

        readonly string[];





    /*
    ======================================================
    Permission
    ======================================================
    */

    readonly permissions:

        readonly PluginPermission[];





    /*
    ======================================================
    Metadata
    ======================================================
    */

    readonly metadata:

        Readonly<Record<string, unknown>>;

}


