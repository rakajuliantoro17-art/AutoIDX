export interface ProductionGateState {
  readonly environmentReady: boolean;
  readonly exchangeReady: boolean;
  readonly riskReady: boolean;
  readonly safetyReady: boolean;
  readonly recoveryReady: boolean;
  readonly persistenceReady: boolean;
  readonly manualApproval: boolean;
  readonly liveTradingEnabled: boolean;
}

export class ProductionGate {
  evaluate(
    state: ProductionGateState,
  ): boolean {
    return (
      state.environmentReady &&
      state.exchangeReady &&
      state.riskReady &&
      state.safetyReady &&
      state.recoveryReady &&
      state.persistenceReady &&
      state.manualApproval &&
      state.liveTradingEnabled
    );
  }
}
