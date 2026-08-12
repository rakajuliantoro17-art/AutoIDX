import {
  IntegrationManager,
} from "./integrationManager";

import {
  IntegrationRegistry,
} from "./integrationRegistry";

import {
  TradingIntegration,
} from "./tradingIntegration";

import {
  RiskIntegration,
} from "./riskIntegration";

import {
  ExecutionIntegration,
} from "./executionIntegration";

import {
  PersistenceIntegration,
} from "./persistenceIntegration";

import {
  RecoveryIntegration,
} from "./recoveryIntegration";

import {
  ObservabilityIntegration,
} from "./observabilityIntegration";

import type {
  IntegrationOptions,
} from "./integrationTypes";

export function createIntegrationManager(
  options: IntegrationOptions = {},
): IntegrationManager {
  const registry =
    new IntegrationRegistry();

  registry.register(
    new TradingIntegration(),
  );

  registry.register(
    new RiskIntegration(),
  );

  registry.register(
    new ExecutionIntegration(),
  );

  registry.register(
    new PersistenceIntegration(),
  );

  registry.register(
    new RecoveryIntegration({
      canTrade: () => true,
    }),
  );

  registry.register(
    new ObservabilityIntegration(),
  );

  return new IntegrationManager(
    registry,
    options,
  );
}
