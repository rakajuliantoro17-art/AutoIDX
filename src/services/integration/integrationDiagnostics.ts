import type {
  IntegrationSnapshot,
} from "./integrationTypes";

export function createIntegrationDiagnostics(
  snapshot: IntegrationSnapshot,
) {
  return Object.freeze({
    generatedAt: Date.now(),
    status: snapshot.status,
    mode: snapshot.mode,
    totalChecks: snapshot.checks.length,
    passedChecks:
      snapshot.checks.filter(
        (check) => check.passed,
      ).length,
    failedChecks:
      snapshot.checks.filter(
        (check) => !check.passed,
      ).length,
    criticalFailures:
      snapshot.checks.filter(
        (check) =>
          check.critical &&
          !check.passed,
      ).length,
  });
}
