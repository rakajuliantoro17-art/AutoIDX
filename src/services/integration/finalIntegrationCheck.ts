import {
  evaluateProductionReadiness,
} from "./productionReadiness";

import type {
  ProductionGateState,
} from "./productionGate";

export interface FinalIntegrationResult {
  readonly ready: boolean;
  readonly blockers: readonly string[];
  readonly liveTradingAllowed: boolean;
}

export function runFinalIntegrationCheck(
  state: ProductionGateState,
): FinalIntegrationResult {
  const result =
    evaluateProductionReadiness(state);

  return Object.freeze({
    ready: result.ready,
    blockers: result.blockers,
    liveTradingAllowed:
      result.ready,
  });
}
