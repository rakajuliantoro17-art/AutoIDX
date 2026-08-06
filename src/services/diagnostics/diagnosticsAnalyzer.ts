/**
==========================================================
AURA Trade OS
Diagnostics Analyzer
Version : 0.3.0 Alpha
==========================================================
Diagnostics Analysis Engine
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface DiagnosticsSnapshot {

    cpuUsage: number;

    memoryUsage: number;

    activeJobs: number;

    errorCount: number;

    warningCount: number;

}





export interface DiagnosticsAnalysis {

    healthy: boolean;

    score: number;

    issues: string[];

    recommendations: string[];

    analyzedAt: Date;

}





/*
==========================================================
Diagnostics Analyzer
==========================================================
*/

export class DiagnosticsAnalyzer {

    /*
    ======================================================
    Analyze
    ======================================================
    */

    public analyze(

        snapshot:

            DiagnosticsSnapshot,

    ): DiagnosticsAnalysis {

        const issues: string[] = [];

        const recommendations: string[] = [];



        if (

            snapshot.cpuUsage > 80

        ) {

            issues.push(

                "High CPU usage.",

            );



            recommendations.push(

                "Reduce workload or scale resources.",

            );

        }



        if (

            snapshot.memoryUsage > 80

        ) {

            issues.push(

                "High memory usage.",

            );



            recommendations.push(

                "Inspect memory-intensive services.",

            );

        }



        if (

            snapshot.errorCount > 0

        ) {

            issues.push(

                "Application errors detected.",

            );



            recommendations.push(

                "Review application logs.",

            );

        }



        const score =

            Math.max(

                0,

                100 -

                issues.length * 20,

            );



        const analysis = {

            healthy:

                issues.length === 0,

            score,

            issues,

            recommendations,

            analyzedAt:

                new Date(),

        };



        logger.info(

            "Diagnostics analysis completed.",

            {

                score,

                issues:

                    issues.length,

            },

        );



        return analysis;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticsAnalyzer =

    new DiagnosticsAnalyzer();
```

