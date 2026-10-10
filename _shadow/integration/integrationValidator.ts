import type {
  IntegrationCheck,
} from "./integrationTypes";

export function validateChecks(
  checks: readonly IntegrationCheck[],
): {
  readonly valid: boolean;
  readonly blockers: readonly string[];
} {
  const blockers = checks
    .filter(
      (check) =>
        check.critical &&
        !check.passed,
    )
    .map(
      (check) =>
        check.message ??
        check.name,
    );

  return Object.freeze({
    valid: blockers.length === 0,
    blockers: Object.freeze(blockers),
  });
}
