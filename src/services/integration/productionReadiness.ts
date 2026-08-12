import {
  ProductionGate,
  type ProductionGateState,
} from "./productionGate";

export interface ProductionReadiness {
  readonly ready: boolean;
  readonly blockers: readonly string[];
}

export function evaluateProductionReadiness(
  state: ProductionGateState,
): ProductionReadiness {
  const blockers: string[] = [];

  if (!state.environmentReady)
    blockers.push("environment");

  if (!state.exchangeReady)
    blockers.push("exchange");

  if (!state.riskReady)
    blockers.push("risk");

  if (!state.safetyReady)
    blockers.push("safety");

  if (!state.recoveryReady)
    blockers.push("recovery");

  if (!state.persistenceReady)
    blockers.push("persistence");

  if (!state.manualApproval)
    blockers.push("manualApproval");

  if (!state.liveTradingEnabled)
    blockers.push("liveTradingEnabled");

  return Object.freeze({
    ready:
      new ProductionGate().evaluate(state),
    blockers: Object.freeze(blockers),
  });
}
