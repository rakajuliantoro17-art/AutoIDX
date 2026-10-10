import type {
  IntegrationMode,
} from "./integrationTypes";

export interface IntegrationContext {
  readonly id: string;
  readonly mode: IntegrationMode;
  readonly startedAt: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createIntegrationContext(
  mode: IntegrationMode = "DEVELOPMENT",
): IntegrationContext {
  return Object.freeze({
    id: `integration-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`,
    mode,
    startedAt: Date.now(),
    metadata: {},
  });
}
