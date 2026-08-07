/**
==========================================================
AURA Trade OS
Validation Pipeline
Version : 0.3.0 Alpha
==========================================================
Validation Pipeline
==========================================================
*/

import type { Validator } from "./validator";
import type { ValidationResult } from "./validationResult";

export interface ValidationPipelineOptions {

    readonly failFast?: boolean;

}

export class ValidationPipeline<T> {

    constructor(

        private readonly validators:

            readonly Validator<T>[],

        private readonly options:

            ValidationPipelineOptions = {},

    ) {}

    public async validate(

        value: T,

    ): Promise<ValidationResult> {

        const issues = [];

        const warnings = [];

        for (const validator of this.validators) {

            const result = await validator.validate(value);

            issues.push(...result.issues);

            warnings.push(...result.warnings);

            if (

                this.options.failFast &&

                !result.valid

            ) {

                break;

            }

        }

        return {

            valid: issues.length === 0,

            issues,

            warnings,

            issueCount: issues.length,

            warningCount: warnings.length,

        };

    }

}


