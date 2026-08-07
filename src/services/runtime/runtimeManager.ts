/**
==========================================================
AURA Trade OS
Runtime Manager
Version : 0.3.0 Alpha
==========================================================
Runtime Orchestrator
==========================================================
*/

import type {

    RuntimeProfile,

} from "./runtimeProfile";

import type {

    RuntimeMetrics,

} from "./runtimeMetrics";

import {

    RuntimeOptimizer,

} from "./runtimeOptimizer";





/*
==========================================================
Runtime Manager
==========================================================
*/

export class RuntimeManager {

    private readonly optimizer =

        new RuntimeOptimizer();





    /*
    ======================================================
    Analyze Runtime
    ======================================================
    */

    public analyze(

        profile: RuntimeProfile,

        metrics: RuntimeMetrics,

    ) {

        return this.optimizer.analyze(

            profile,

            metrics,

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const runtimeManager =

    new RuntimeManager();

