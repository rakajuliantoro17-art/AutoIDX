/**
==========================================================
AURA Trade OS
Diagnostics Report
Version : 0.3.0 Alpha
==========================================================
Diagnostics Report Builder
==========================================================
*/

import type {

    DiagnosticsAnalysis,

} from "./diagnosticsAnalyzer";

import type {

    DiagnosticsSnapshot,

} from "./diagnosticsCollector";





/*
==========================================================
Types
==========================================================
*/

export interface DiagnosticsReport {

    title: string;

    generatedAt: Date;

    score: number;

    healthy: boolean;

    issues: string[];

    recommendations: string[];

}




/*
==========================================================
Diagnostics Report
==========================================================
*/

export class DiagnosticsReportBuilder {

    /*
    ======================================================
    Build
    ======================================================
    */

    public build(

        snapshot:

            DiagnosticsSnapshot,

        analysis:

            DiagnosticsAnalysis,

    ): DiagnosticsReport {

        return {

            title:

                "AURA Trade OS Diagnostics",

            generatedAt:

                new Date(),

            score:

                analysis.score,

            healthy:

                analysis.healthy,

            issues:

                analysis.issues,

            recommendations:

                analysis.recommendations,

        };

    }

}




/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticsReport =

    new DiagnosticsReportBuilder();
