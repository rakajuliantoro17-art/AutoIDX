export interface IntegrationSuccess<T = void> {
  readonly ok: true;
  readonly value: T;
}

export interface IntegrationFailure {
  readonly ok: false;
  readonly error: Error;
}

export type IntegrationResult<T = void> =
  | IntegrationSuccess<T>
  | IntegrationFailure;

export function success<T>(value: T): IntegrationSuccess<T> {
  return {
    ok: true,
    value,
  };
}

export function failure(error: unknown): IntegrationFailure {
  return {
    ok: false,
    error:
      error instanceof Error
        ? error
        : new Error(String(error)),
  };
}
