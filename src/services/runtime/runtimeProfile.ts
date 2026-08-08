/**
==========================================================
AURA Trade OS
Runtime Profile
Version : 0.3.0 Alpha
==========================================================
Runtime Profile Definition
==========================================================
*/

import type { RuntimeEnvironmentName } from "./runtimeEnvironment";

export type RuntimePlatform =

    | "node"

    | "browser"

    | "edge"

    | "worker";

export interface RuntimeProfile {

    /*
    ======================================================
    Identity
    ======================================================
    */

    readonly id: string;

    readonly name: string;

    /*
    ======================================================
    Runtime
    ======================================================
    */

    readonly environment:

        RuntimeEnvironmentName;

    readonly platform:

        RuntimePlatform;

    /*
    ======================================================
    Features
    ======================================================
    */

    readonly features:

        Readonly<Record<string, boolean>>;

    /*
    ======================================================
    Metadata
    ======================================================
    */

    readonly metadata:

        Readonly<Record<string, unknown>>;
}
