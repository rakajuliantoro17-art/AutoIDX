/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 6
 * Duplicate Order Guard
 * ==========================================================
 */

import type {
  IdempotencyRecord,
  IdempotencyStore,
} from "./idempotencyStore";

export interface DuplicateGuardResult {
  readonly allowed: boolean;
  readonly reason: string;
  readonly existing?: IdempotencyRecord;
}

export class DuplicateOrderGuard {

  constructor(
    private readonly store:
      IdempotencyStore,
  ) {}

  async check(
    key: string,
  ): Promise<DuplicateGuardResult> {

    const existing =
      await this.store.get(key);

    if (!existing) {
      return {
        allowed: true,
        reason:
          "No previous execution found.",
      };
    }

    if (
      existing.status ===
        "COMPLETED" ||
      existing.status ===
        "SUBMITTED" ||
      existing.status ===
        "RESERVED"
    ) {
      return {
        allowed: false,
        reason:
          "Duplicate execution blocked.",
        existing,
      };
    }

    if (
      existing.status ===
      "UNCERTAIN"
    ) {
      return {
        allowed: false,
        reason:
          "Previous execution is uncertain and requires reconciliation.",
        existing,
      };
    }

    return {
      allowed: true,
      reason:
        "Previous execution failed and may be retried.",
      existing,
    };
  }
}
