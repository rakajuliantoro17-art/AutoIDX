/**
==========================================================
AURA Trade OS
Validation Pipeline
Version : 0.3.1 Alpha

Perubahan dari 0.3.0: object hasil validate() sebelumnya
menyertakan `issueCount`/`warningCount`, properti yang tidak
ada di kontrak kanonik ValidationResult (validationResult.ts,
cuma punya valid/issues/warnings) - dihapus dari sini. Kalau
consumer butuh jumlahnya, tinggal `.issues.length`/
`.warnings.length` dari hasilnya, tidak perlu field terpisah.

Juga: `issues`/`warnings` sekarang dikasih tipe eksplisit
(sebelumnya inferred, berisiko implicit-any di strict mode).
==========================================================
Validation Pipeline
==========================================================
*/

import type { Validator } from "./validator";
import type {
    ValidationResult,
    ValidationIssue,
    ValidationWarning,
} from "./validationResult";

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

        const issues: ValidationIssue[] = [];
        const warnings: ValidationWarning[] = [];

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
        };

    }

}
