/**
==========================================================
AURA Trade OS
Diagnostics Reader
Version : 0.3.0 Alpha
==========================================================
Diagnostics Read Repository
==========================================================
*/

import { logger } from "@/services/logger";

import type {

    DiagnosticsReport,

} from "./diagnosticsReport";

import {

    diagnosticsStorage,

} from "./diagnosticsStorage";





/*
==========================================================
Diagnostics Reader
==========================================================
*/

export class DiagnosticsReader {

    /*
    ======================================================
    Latest
    ======================================================
    */

    public async latest():

        Promise<

            DiagnosticsReport |

            undefined

        > {

        logger.debug(

            "Reading latest diagnostics report.",

        );



        const reports =

            await diagnosticsStorage.getAll();



        return reports.at(

            -1,

        );

    }





    /*
    ======================================================
    All
    ======================================================
    */

    public async all():

        Promise<

            DiagnosticsReport[]

        > {

        logger.debug(

            "Reading diagnostics reports.",

        );



        return diagnosticsStorage.getAll();

    }





    /*
    ======================================================
    Count
    ======================================================
    */

    public async count():

        Promise<number> {

        const reports =

            await diagnosticsStorage.getAll();



        return reports.length;

    }





    /*
    ======================================================
    Healthy
    ======================================================
    */

    public async healthy():

        Promise<

            DiagnosticsReport[]

        > {

        const reports =

            await diagnosticsStorage.getAll();



        return reports.filter(

            report =>

                report.healthy,

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticsReader =

    new DiagnosticsReader();

