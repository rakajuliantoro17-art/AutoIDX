/**
==========================================================
AURA Trade OS
AI Feature Validator
Phase 31
==========================================================
*/

import type {
    FeatureSet,
} from "./featureSet";

export interface FeatureValidationIssue {
    readonly feature?: string;
    readonly code:
        | "MISSING"
        | "INVALID"
        | "NON_FINITE";
    readonly message: string;
}

export interface FeatureValidationResult {
    readonly valid: boolean;
    readonly issues:
        readonly FeatureValidationIssue[];
}

export class FeatureValidator {
    public validate(
        featureSet: FeatureSet,
        requiredFeatures:
            readonly string[] = [],
    ): FeatureValidationResult {
        const issues:
            FeatureValidationIssue[] = [];

        const available =
            new Set(
                featureSet.features.map(
                    (feature) =>
                        feature.name,
                ),
            );

        for (
            const name of requiredFeatures
        ) {
            if (!available.has(name)) {
                issues.push({
                    feature: name,
                    code: "MISSING",
                    message:
                        `Required feature "${name}" is missing`,
                });
            }
        }

        for (const feature of featureSet.features) {
            if (
                feature.value === null
            ) {
                issues.push({
                    feature:
                        feature.name,
                    code: "INVALID",
                    message:
                        "Feature value is null",
                });

                continue;
            }

            if (
                typeof feature.value ===
                "number" &&
                !Number.isFinite(
                    feature.value,
                )
            ) {
                issues.push({
                    feature:
                        feature.name,
                    code: "NON_FINITE",
                    message:
                        "Feature value must be finite",
                });
            }
        }

        return {
            valid:
                issues.length === 0,
            issues,
        };
    }
}

export const featureValidator =
    new FeatureValidator();

export default FeatureValidator;
