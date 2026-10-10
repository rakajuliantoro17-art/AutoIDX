export const INTEGRATION_EVENTS = Object.freeze({
  INITIALIZING:
    "integration.initializing",
  READY:
    "integration.ready",
  DEGRADED:
    "integration.degraded",
  FAILED:
    "integration.failed",
  HALTED:
    "integration.halted",
} as const);

export type IntegrationEvent =
  typeof INTEGRATION_EVENTS[
    keyof typeof INTEGRATION_EVENTS
  ];
