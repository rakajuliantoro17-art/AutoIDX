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

} from "./diagnosticsSnapshot";





/*
==========================================================
Types
==========================================================
*/

export interface DiagnosticsReport {

    title: string;

    generatedAt: Date;

    snapshot: DiagnosticsSnapshot;

    analysis: DiagnosticsAnalysis;

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

            snapshot,

            analysis,

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

