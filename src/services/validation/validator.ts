/**
==========================================================
AURA Trade OS
Validator
Version : 0.3.1 Alpha

Perubahan dari 0.3.0: ValidationIssue dan ValidationResult
sebelumnya didefinisikan ulang di sini, identik (tapi lebih
sederhana, tanpa `warnings`) dengan versi di validationResult.ts
- menyebabkan collision saat index.ts export * dari keduanya.
Sekarang import dari validationResult.ts (sumber kanonik).
==========================================================
Validation Contract
==========================================================
*/

import type {
    ValidationResult,
} from "./validationResult";

import type {
    ValidationContext,
} from "./validationContext";

export interface Validator<T = unknown> {

    /*
    ======================================================
    Validate
    ======================================================
    */

    validate(
        value: T,
        context?: ValidationContext,
    ): ValidationResult;

}
