/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 8
 * Production Readiness
 * ==========================================================
 */

export interface ProductionReadinessInput {
  readonly typecheckPassed: boolean;
  readonly testsPassed: boolean;
  readonly environmentValid: boolean;
  readonly exchangeReachable: boolean;
  readonly reconciliationReady: boolean;
  readonly persistenceReady: boolean;
  readonly recoveryReady: boolean;
  readonly killSwitchReady: boolean;
  readonly duplicateProtectionReady: boolean;
}

export interface ProductionReadiness {
  readonly ready: boolean;
  readonly blockers: readonly string[];
  readonly checkedAt: number;
}

export function evaluateProductionReadiness(
  input: ProductionReadinessInput,
): ProductionReadiness {

  const blockers: string[] = [];

  if (!input.typecheckPassed)
    blockers.push(
      "TypeScript validation failed.",
    );

  if (!input.testsPassed)
    blockers.push(
      "Automated tests failed.",
    );

  if (!input.environmentValid)
    blockers.push(
      "Production environment is invalid.",
    );

  if (!input.exchangeReachable)
    blockers.push(
      "Exchange is unreachable.",
    );

  if (!input.reconciliationReady)
    blockers.push(
      "Reconciliation is not ready.",
    );

  if (!input.persistenceReady)
    blockers.push(
      "Persistence is not ready.",
    );

  if (!input.recoveryReady)
    blockers.push(
      "Recovery system is not ready.",
    );

  if (!input.killSwitchReady)
    blockers.push(
      "Kill switch is not ready.",
    );

  if (!input.duplicateProtectionReady)
    blockers.push(
      "Duplicate-order protection is not ready.",
    );

  return {
    ready:
      blockers.length === 0,

    blockers,

    checkedAt:
      Date.now(),
  };
}
