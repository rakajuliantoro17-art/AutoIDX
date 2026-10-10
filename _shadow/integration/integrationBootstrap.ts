import {
  IntegrationManager,
} from "./integrationManager";

import {
  IntegrationRegistry,
} from "./integrationRegistry";

import {
  TradingIntegration,
} from "./tradingIntegration";

import type {
  TradingExecutionAdapter,
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

  /*
   * TODO: belum ada implementasi TradingExecutionAdapter yang
   * nyata di codebase ini. Stub ini sengaja SELALU gagal
   * (bukan pura-pura sukses) supaya tidak ada order yang
   * "hilang diam-diam" kalau TradingIntegration terpanggil
   * sebelum benar-benar disambungkan ke execution engine asli.
   */
  const notImplementedExecutionAdapter: TradingExecutionAdapter = {
    execute: async (request) => ({
      success: false,
      status: "FAILED",
      requestId: request.requestId ?? "unknown",
      symbol: request.symbol,
      side: request.side,
      amount: request.amount,
      error: "TradingExecutionAdapter belum diimplementasikan.",
      timestamp: Date.now(),
    }),
  };

  registry.register(
    new TradingIntegration({
      execution: notImplementedExecutionAdapter,
    }),
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
