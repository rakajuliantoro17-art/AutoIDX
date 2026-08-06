/**
==========================================================
AURA Trade OS
Runtime Optimizer
Version : 0.3.0 Alpha
==========================================================
Runtime Optimization Advisor
==========================================================
*/

import type { RuntimeProfile } from "./runtimeProfile";





/*
==========================================================
Types
==========================================================
*/

export interface RuntimeOptimizationRecommendation {

    readonly category: string;

    readonly message: string;

    readonly priority:

        "low"

        | "medium"

        | "high";

}





/*
==========================================================
Runtime Optimizer
==========================================================
*/

export class RuntimeOptimizer {

    /*
    ======================================================
    Analyze
    ======================================================
    */

    public analyze(

        profile: RuntimeProfile,

    ): RuntimeOptimizationRecommendation[] {

        const recommendations:

            RuntimeOptimizationRecommendation[] = [];



        if (

            profile.environment ===

            "development"

        ) {

            recommendations.push({

                category:

                    "logging",

                priority:

                    "low",

                message:

                    "Verbose logging is enabled.",

            });

        }



        if (

            !profile.features.cache

        ) {

            recommendations.push({

                category:

                    "cache",

                priority:

                    "medium",

                message:

                    "Enable cache for better performance.",

            });

        }



        return recommendations;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const runtimeOptimizer =

    new RuntimeOptimizer();

