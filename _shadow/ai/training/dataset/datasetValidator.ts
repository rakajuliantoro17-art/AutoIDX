/**
==========================================================
AURA Trade OS
AI Training Dataset Validator
Phase 33
==========================================================
*/

import type {
    DatasetRecord,
} from "./datasetRecord";

import type {
    DatasetSchema,
} from "./datasetSchema";

export interface DatasetValidationIssue {
    readonly recordId?: string;
    readonly field?: string;
    readonly message: string;
    readonly severity:
        | "ERROR"
        | "WARNING";
}

export interface DatasetValidationResult {
    readonly valid: boolean;
    readonly recordCount: number;
    readonly issues:
        readonly DatasetValidationIssue[];
}

export class DatasetValidator {
    public validate(
        schema: DatasetSchema,
        records: readonly DatasetRecord[],
    ): DatasetValidationResult {
        const issues:
            DatasetValidationIssue[] =
            [];

        for (const record of records) {
            for (const feature of schema.features) {
                const value =
                    record.features[
                        feature.name
                    ];

                if (
                    feature.required &&
                    value === undefined
                ) {
                    issues.push({
                        recordId:
                            record.id,
                        field:
                            feature.name,
                        message:
                            "Required feature is missing",
                        severity: "ERROR",
                    });

                    continue;
                }

                if (
                    value === null &&
                    !feature.nullable
                ) {
                    issues.push({
                        recordId:
                            record.id,
                        field:
                            feature.name,
                        message:
                            "Feature cannot be null",
                        severity: "ERROR",
                    });
                }
            }

            if (
                schema.target &&
                schema.target.required &&
                record.target ===
                    undefined
            ) {
                issues.push({
                    recordId:
                        record.id,
                    field:
                        schema.target.name,
                    message:
                        "Target value is missing",
                    severity: "ERROR",
                });
            }
        }

        return {
            valid: !issues.some(
                (issue) =>
                    issue.severity ===
                    "ERROR",
            ),
            recordCount:
                records.length,
            issues,
        };
    }
}

export const datasetValidator =
    new DatasetValidator();

export default DatasetValidator;
