/**
==========================================================
AURA Trade OS
Runtime Inspector
Version : 0.3.0 Alpha
==========================================================
Runtime Inspection Engine
==========================================================
*/

import type {

    RuntimeMetrics,

} from "./runtimeMetrics";





/*
==========================================================
Types
==========================================================
*/

export interface RuntimeInspectionIssue {

    readonly category: string;

    readonly severity:

        "info"

        | "warning"

        | "critical";

    readonly message: string;

}





export interface RuntimeInspectionReport {

    readonly healthy: boolean;

    readonly issues:

        readonly RuntimeInspectionIssue[];

}





/*
==========================================================
Runtime Inspector
==========================================================
*/

export class RuntimeInspector {

    /*
    ======================================================
    Inspect
    ======================================================
    */

    public inspect(

        metrics: RuntimeMetrics,

    ): RuntimeInspectionReport {

        const issues:

            RuntimeInspectionIssue[] = [];



        if (

            metrics.cpuUsage > 90

        ) {

            issues.push({

                category:

                    "cpu",

                severity:

                    "critical",

                message:

                    "CPU usage is above 90%.",

            });

        }



        if (

            metrics.memoryUsage >

            metrics.memoryTotal * 0.9

        ) {

            issues.push({

                category:

                    "memory",

                severity:

                    "warning",

                message:

                    "Memory usage exceeds 90%.",

            });

        }



        return {

            healthy:

                issues.length === 0,

            issues,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const runtimeInspector =

    new RuntimeInspector();

