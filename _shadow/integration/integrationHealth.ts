import type {
  IntegrationSnapshot,
} from "./integrationTypes";

export interface IntegrationHealth {
  readonly healthy: boolean;
  readonly status: IntegrationSnapshot["status"];
  readonly failedChecks: number;
  readonly criticalFailures: number;
}

export function getIntegrationHealth(
  snapshot: IntegrationSnapshot,
): IntegrationHealth {
  const failed =
    snapshot.checks.filter(
      (check) => !check.passed,
    );

  const critical =
    failed.filter(
      (check) => check.critical,
    );

  return Object.freeze({
    healthy:
      snapshot.status === "READY" &&
      critical.length === 0,
    status: snapshot.status,
    failedChecks: failed.length,
    criticalFailures:
      critical.length,
  });
}
