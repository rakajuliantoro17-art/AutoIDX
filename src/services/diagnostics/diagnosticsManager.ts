/**
==========================================================
AURA Trade OS
Diagnostics Manager
Version : 0.3.0 Alpha
==========================================================
Diagnostics Orchestrator
==========================================================
*/

import { logger } from "@/services/logger";

import {

    diagnosticsCollector,

} from "./diagnosticsCollector";

import {

    diagnosticsAnalyzer,

} from "./diagnosticsAnalyzer";

import {

    diagnosticsReport,

} from "./diagnosticsReport";

import {

    diagnosticsExporter,

} from "./diagnosticsExporter";

import {

    diagnosticsStorage,

} from "./diagnosticsStorage";





/*
==========================================================
Diagnostics Manager
==========================================================
*/

export class DiagnosticsManager {

    /*
    ======================================================
    Run Diagnostics
    ======================================================
    */

    public async runDiagnostics():

        Promise<string> {

        logger.info(

            "Running diagnostics.",

        );



        const snapshot =

            await diagnosticsCollector.collect();



        const analysis =

            diagnosticsAnalyzer.analyze(

                snapshot,

            );



        const report =

            diagnosticsReport.build(

                snapshot,

                analysis,

            );



        await diagnosticsStorage.save(

            report,

        );



        return diagnosticsExporter.export(

            report,

            "json",

        );

    }





    /*
    ======================================================
    Quick Health
    ======================================================
    */

    public async isHealthy():

        Promise<boolean> {

        const snapshot =

            await diagnosticsCollector.collect();



        const analysis =

            diagnosticsAnalyzer.analyze(

                snapshot,

            );



        return analysis.healthy;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticsManager =

    new DiagnosticsManager();

