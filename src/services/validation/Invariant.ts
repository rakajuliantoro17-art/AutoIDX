export interface Phase37InvariantInput {
  readonly liveTradingEnabled: boolean;

  readonly safetyCanTrade: boolean;

  readonly recoveryCanTrade: boolean;

  readonly exchangeAuthenticated: boolean;

  readonly persistenceReady: boolean;

  readonly reconciliationReady: boolean;

  readonly auditReady: boolean;
}

export function assertPhase37Invariants(
  input: Phase37InvariantInput,
): void {

  if (
    !input.liveTradingEnabled
  ) {
    return;
  }

  const failures: string[] = [];

  if (!input.safetyCanTrade) {
    failures.push(
      "Safety layer is not ready",
    );
  }

  if (!input.recoveryCanTrade) {
    failures.push(
      "Recovery layer is not ready",
    );
  }

  if (!input.exchangeAuthenticated) {
    failures.push(
      "Exchange authentication is not ready",
    );
  }

  if (!input.persistenceReady) {
    failures.push(
      "Persistence layer is not ready",
    );
  }

  if (!input.reconciliationReady) {
    failures.push(
      "Reconciliation layer is not ready",
    );
  }

  if (!input.auditReady) {
    failures.push(
      "Audit layer is not ready",
    );
  }

  if (failures.length > 0) {
    throw new Error(
      `Phase 37 invariant violation: ${failures.join("; ")}`,
    );
  }
}
