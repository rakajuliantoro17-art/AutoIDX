/**
==========================================================
AURA Trade OS
Health Report
Version : 0.2.0 Alpha
==========================================================
Health Report Generator
==========================================================
*/

import {

    healthManager,

} from "./healthManager";

import type {

    SystemHealthReport,

} from "./checks/systemHealth";





/*
==========================================================
Types
==========================================================
*/

export interface HealthReport {

    generatedAt: Date;

    uptime: number;

    overallStatus: string;

    report: SystemHealthReport;

}





/*
==========================================================
Health Report
==========================================================
*/

export class HealthReportService {

    /*
    ======================================================
    Generate
    ======================================================
    */

    public async generate():

        Promise<HealthReport> {

        const report =

            await healthManager.check();



        return {

            generatedAt:

                new Date(),

            uptime:

                process.uptime(),

            overallStatus:

                report.status,

            report,

        };

    }





    /*
    ======================================================
    JSON
    ======================================================
    */

    public async toJSON():

        Promise<string> {

        const report =

            await this.generate();



        return JSON.stringify(

            report,

            null,

            2,

        );

    }





    /*
    ======================================================
    Summary
    ======================================================
    */

    public async summary():

        Promise<string> {

        const report =

            await this.generate();



        return [

            "========= HEALTH REPORT =========",

            `Status : ${report.overallStatus}`,

            `Uptime : ${report.uptime.toFixed(0)} sec`,

            `Generated : ${report.generatedAt.toISOString()}`,

        ].join("\n");

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const healthReport =

    new HealthReportService();

