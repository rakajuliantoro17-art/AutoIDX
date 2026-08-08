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

export interface PluginManifest {

    readonly id: string;
    readonly name: string;
    readonly version: string;

    readonly description: string;
    readonly author: string;

    readonly engine: string;

    readonly dependencies: readonly string[];

    readonly permissions: readonly PluginPermission[];

    readonly metadata: Readonly<Record<string, unknown>>;

}
