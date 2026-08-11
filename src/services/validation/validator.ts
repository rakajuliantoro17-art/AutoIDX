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

import type {
  Phase37InvariantInput,
} from "./phase37Invariant";

import {
  assertPhase37Invariants,
} from "./phase37Invariant";

export interface Phase37ValidationResult {
  readonly valid: boolean;

  readonly errors: readonly string[];

  readonly timestamp: number;
}

export function validatePhase37(
  input: Phase37InvariantInput,
): Phase37ValidationResult {

  try {
    assertPhase37Invariants(input);

    return Object.freeze({
      valid: true,
      errors: [],
      timestamp: Date.now(),
    });

  } catch (error) {
    return Object.freeze({
      valid: false,

      errors: [
        error instanceof Error
          ? error.message
          : "Unknown Phase 37 validation error",
      ],

      timestamp: Date.now(),
    });
  }
}
