/**
==========================================================
AURA Trade OS
Diagnostics Exporter
Version : 0.3.0 Alpha
==========================================================
Diagnostics Export Adapter
==========================================================
*/

import logger from "@/services/logger";

import type {

    DiagnosticsReport,

} from "./diagnosticsReport";

/*
==========================================================
Types
==========================================================
*/

export type DiagnosticsExportFormat =

    | "json"

    | "markdown"

    | "text";

/*
==========================================================
Diagnostics Exporter
==========================================================
*/

export class DiagnosticsExporter {

    /*
    ======================================================
    Export
    ======================================================
    */

    public export(
        report: DiagnosticsReport,
        format: DiagnosticsExportFormat,
    ): string {

        switch (format) {

            case "json":

                return this.exportJson(
                    report,
                );

            case "markdown":

                return this.exportMarkdown(
                    report,
                );

            case "text":

                return this.exportText(
                    report,
                );

            default:

                throw new Error(
                    `Unsupported export format: ${format}`,
                );

        }

    }

    /*
    ======================================================
    JSON
    ======================================================
    */

    private exportJson(
        report: DiagnosticsReport,
    ): string {

        logger.info(
            "Diagnostics exported as JSON.",
        );

        return JSON.stringify(
            report,
            null,
            2,
        );

    }

    /*
    ======================================================
    Markdown
    ======================================================
    */

    private exportMarkdown(
        report: DiagnosticsReport,
    ): string {

        logger.info(
            "Diagnostics exported as Markdown.",
        );

        return [
            `# ${report.title}`,
            "",
            `Health : ${report.analysis.healthy}`,
            `Score : ${report.analysis.score}`,
            "",
            "## Issues",
            ...report.analysis.issues.map(
                issue =>
                    `- ${issue}`,
            ),
            "",
            "## Recommendations",
            ...report.analysis.recommendations.map(
                recommendation =>
                    `- ${recommendation}`,
            ),
        ].join("\n");

    }

    /*
    ======================================================
    Text
    ======================================================
    */

    private exportText(
        report: DiagnosticsReport,
    ): string {

        logger.info(
            "Diagnostics exported as Text.",
        );

        return [
            report.title,
            `Health: ${report.analysis.healthy}`,
            `Score: ${report.analysis.score}`,
            `Issues: ${report.analysis.issues.length}`,
            `Recommendations: ${report.analysis.recommendations.length}`,
        ].join("\n");

    }

}

/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticsExporter =

    new DiagnosticsExporter();
