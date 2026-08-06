/**
==========================================================
AURA Trade OS
System Report Service
Version : 0.1.0 Alpha
==========================================================
Generate System Health Report
==========================================================
*/

import {

    diagnosticService,

    DiagnosticReport,

} from "./diagnostic";





/*
==========================================================
Types
==========================================================
*/

export type SystemHealth =

    | "HEALTHY"

    | "WARNING"

    | "CRITICAL";



export interface SystemSummary {

    total: number;

    passed: number;

    warnings: number;

    failed: number;

}



export interface SystemReport {

    status: SystemHealth;

    summary: SystemSummary;

    report: DiagnosticReport;

    generatedAt: number;

}





/*
==========================================================
System Report Service
==========================================================
*/

export class SystemReportService {

    /*
    ======================================================
    Summary
    ======================================================
    */

    private buildSummary(

        report: DiagnosticReport,

    ): SystemSummary {

        return {

            total:

                report.items.length,

            passed:

                report.items.filter(

                    item =>

                        item.status === "PASS"

                ).length,

            warnings:

                report.items.filter(

                    item =>

                        item.status === "WARNING"

                ).length,

            failed:

                report.items.filter(

                    item =>

                        item.status === "FAIL"

                ).length,

        };

    }





    /*
    ======================================================
    Overall Health
    ======================================================
    */

    private calculateHealth(

        summary: SystemSummary,

    ): SystemHealth {

        if (

            summary.failed > 0

        ) {

            return "CRITICAL";

        }

        if (

            summary.warnings > 0

        ) {

            return "WARNING";

        }

        return "HEALTHY";

    }





    /*
    ======================================================
    Generate
    ======================================================
    */

    public generate(): SystemReport {

        const report =

            diagnosticService.run();

        const summary =

            this.buildSummary(

                report

            );

        return {

            status:

                this.calculateHealth(

                    summary

                ),

            summary,

            report,

            generatedAt:

                Date.now(),

        };

    }





    /*
    ======================================================
    Console Output
    ======================================================
    */

    public print(): void {

        const result =

            this.generate();

        console.log("");

        console.log("========================================");

        console.log("AURA Trade OS System Report");

        console.log("========================================");

        console.log("");

        console.log(

            `Status : ${result.status}`

        );

        console.log(

            `PASS   : ${result.summary.passed}`

        );

        console.log(

            `WARN   : ${result.summary.warnings}`

        );

        console.log(

            `FAIL   : ${result.summary.failed}`

        );

        console.log("");

        for (

            const item of result.report.items

        ) {

            console.log(

                `[${item.status}] ${item.name}`

            );

            console.log(

                `  ${item.message}`

            );

        }

        console.log("");

    }





    /*
    ======================================================
    JSON
    ======================================================
    */

    public toJSON(): SystemReport {

        return this.generate();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const systemReportService =

    new SystemReportService();

