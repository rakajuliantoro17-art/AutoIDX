/**
==========================================================
AURA Trade OS
Runtime Flags
Version : 0.3.0 Alpha
==========================================================
Runtime Feature Flags
==========================================================
*/

export interface RuntimeFlags {

    /*
    ======================================================
    Runtime
    ======================================================
    */

    readonly hotReload: boolean;

    readonly diagnostics: boolean;

    readonly profiling: boolean;

    readonly tracing: boolean;





    /*
    ======================================================
    Execution
    ======================================================
    */

    readonly workerThreads: boolean;

    readonly parallelExecution: boolean;





    /*
    ======================================================
    Performance
    ======================================================
    */

    readonly cache: boolean;

    readonly optimization: boolean;





    /*
    ======================================================
    Plugin
    ======================================================
    */

    readonly plugins: boolean;

    readonly sandbox: boolean;

}


