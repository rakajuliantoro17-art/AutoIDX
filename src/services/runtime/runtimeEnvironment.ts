/**
==========================================================
AURA Trade OS
Runtime Environment
Version : 0.3.0 Alpha
==========================================================
Runtime Environment Definition
==========================================================
*/





/*
==========================================================
Environment
==========================================================
*/

export type RuntimeEnvironmentName =

    | "development"

    | "testing"

    | "staging"

    | "production";





/*
==========================================================
Runtime
==========================================================
*/

export type RuntimeType =

    | "node"

    | "browser"

    | "edge"

    | "worker";





/*
==========================================================
Deployment
==========================================================
*/

export type DeploymentMode =

    | "local"

    | "cloud"

    | "container"

    | "serverless";





/*
==========================================================
Environment
==========================================================
*/

export interface RuntimeEnvironment {

    readonly environment:

        RuntimeEnvironmentName;





    readonly runtime:

        RuntimeType;





    readonly deployment:

        DeploymentMode;





    readonly debug: boolean;





    readonly production: boolean;

}

