/**
==========================================================
AURA Trade OS
Plugin Context
Version : 0.3.0 Alpha
==========================================================
Plugin Dependency Context
==========================================================
*/

import type { PluginSandbox } from "./pluginSandbox";

/*
==========================================================
Plugin Context
==========================================================
*/

export interface PluginContext {

    /*
    ======================================================
    Sandbox
    ======================================================
    */

    readonly sandbox: PluginSandbox;

    /*
    ======================================================
    Services
    ======================================================
    */

    readonly services:

        Readonly<Record<string, unknown>>;

    /*
    ======================================================
    Configuration
    ======================================================
    */

    readonly configuration:

        Readonly<Record<string, unknown>>;

    /*
    ======================================================
    Metadata
    ======================================================
    */

    readonly metadata:

        Readonly<Record<string, unknown>>;

}
