/**
==========================================================
AURA Trade OS
Diagnostics Storage
Version : 0.3.0 Alpha
==========================================================
Diagnostics Storage Repository
==========================================================
*/

import logger from "@/services/logger";

import type {

    DiagnosticsReport,

} from "./diagnosticsReport";





/*
==========================================================
Diagnostics Storage
==========================================================
*/

export class DiagnosticsStorage {

    private readonly reports:

        DiagnosticsReport[] = [];





    /*
    ======================================================
    Save
    ======================================================
    */

    public async save(

        report:

            DiagnosticsReport,

    ): Promise<void> {

        this.reports.push(

            report,

        );



        logger.debug(

            "Diagnostics report stored.",

        );

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public async clear():

        Promise<void> {

        this.reports.length = 0;



        logger.info(

            "Diagnostics storage cleared.",

        );

    }





    /*
    ======================================================
    Size
    ======================================================
    */

    public size():

        number {

        return this.reports.length;

    }





    /*
    ======================================================
    Internal
    ======================================================
    */

    public async getAll():

        Promise<

            readonly DiagnosticsReport[]

        > {

        return [

            ...this.reports,

        ];

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticsStorage =

    new DiagnosticsStorage();

