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

export interface PluginContext {

    readonly sandbox: PluginSandbox;

    readonly services: Readonly<Record<string, unknown>>;

    readonly configuration: Readonly<Record<string, unknown>>;

    readonly metadata: Readonly<Record<string, unknown>>;

}
