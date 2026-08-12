export interface LiveTradingGateState {
  readonly runtimeReady: boolean;
  readonly safetyReady: boolean;
  readonly recoveryReady: boolean;
  readonly riskReady: boolean;
  readonly exchangeReady: boolean;
  readonly persistenceReady: boolean;
  readonly productionMode: boolean;
  readonly explicitlyEnabled: boolean;
}

export class LiveTradingGate {
  evaluate(
    state: LiveTradingGateState,
  ): boolean {
    return (
      state.runtimeReady &&
      state.safetyReady &&
      state.recoveryReady &&
      state.riskReady &&
      state.exchangeReady &&
      state.persistenceReady &&
      state.productionMode &&
      state.explicitlyEnabled
    );
  }
}
