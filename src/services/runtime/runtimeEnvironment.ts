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



/*
==========================================================
Detection
==========================================================
Mendeteksi tempat kode ini berjalan, dari variabel
environment saja (murni, stateless, tanpa I/O). Dipakai agar
fitur yang bergantung pada proses berumur panjang (state di
memori, timer/interval, scheduler internal) hanya aktif di
server fisik/container, dan TIDAK di serverless (Vercel)
tempat memori hilang setiap instance dingin.
==========================================================
*/

export type RuntimeEnv = Readonly<
    Record<string, string | undefined>
>;

export interface RuntimeCapabilities {
    /** State di memori bertahan antar-request/siklus. */
    readonly persistentMemory: boolean;
    /** Aman memakai setInterval/scheduler di dalam proses. */
    readonly backgroundTimers: boolean;
}

export interface DetectedRuntime
    extends RuntimeEnvironment {
    readonly capabilities: RuntimeCapabilities;
}

export function detectRuntimeEnvironment(
    env: RuntimeEnv = process.env,
): DetectedRuntime {

    const nodeEnv =
        env.NODE_ENV;

    const environment:
        RuntimeEnvironmentName =
            env.VERCEL_ENV === "preview"
                ? "staging"
                : nodeEnv === "production"
                    ? "production"
                    : nodeEnv === "test"
                        ? "testing"
                        : "development";

    const runtime:
        RuntimeType =
            env.NEXT_RUNTIME === "edge"
                ? "edge"
                : "node";

    const serverless =
        Boolean(
            env.VERCEL ||
            env.AWS_LAMBDA_FUNCTION_NAME ||
            env.NETLIFY ||
            env.FUNCTION_TARGET,
        );

    const container =
        Boolean(
            env.KUBERNETES_SERVICE_HOST ||
            env.container ||
            env.DOCKER_CONTAINER,
        );

    const deployment:
        DeploymentMode =
            serverless
                ? "serverless"
                : container
                    ? "container"
                    : environment === "production"
                        ? "cloud"
                        : "local";

    return {
        environment,
        runtime,
        deployment,
        debug:
            environment === "development",
        production:
            environment === "production",
        capabilities: {
            persistentMemory:
                deployment !== "serverless" &&
                runtime !== "edge",
            backgroundTimers:
                deployment !== "serverless" &&
                runtime !== "edge",
        },
    };

}
