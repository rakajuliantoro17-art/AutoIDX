/**
==========================================================
AURA Trade OS
Plugin Core
Version : 0.3.0 Alpha
==========================================================
Plugin Interface Definition
==========================================================
*/

import type { PluginManifest } from "./pluginManifest";
import type { PluginContext } from "./pluginContext";

/*
==========================================================
Plugin
==========================================================
*/

export interface Plugin {

    readonly id: string;

    readonly name: string;

    readonly version: string;

    readonly manifest: PluginManifest;

    readonly stages: readonly string[];

    initialize(context?: PluginContext): Promise<void> | void;

    start(): Promise<void> | void;

    stop(): Promise<void> | void;

    dispose(): Promise<void> | void;

}
