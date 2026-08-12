/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 8
 * Production Gate
 * ==========================================================
 */

import type {
  ProductionReadiness,
} from "./productionReadiness";

export class ProductionGate {

  private unlocked = false;

  unlock(
    readiness: ProductionReadiness,
  ): void {

    if (!readiness.ready) {
      throw new Error(
        `Production gate blocked: ${readiness.blockers.join(
          " | ",
        )}`,
      );
    }

    this.unlocked = true;
  }

  lock(): void {
    this.unlocked = false;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  assertUnlocked(): void {
    if (!this.unlocked) {
      throw new Error(
        "Production gate is locked.",
      );
    }
  }
}
