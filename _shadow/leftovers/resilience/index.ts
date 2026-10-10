/**
 * AURA Trade OS -- Resilience
 *
 * Aktif: retry (retryExecutor + policy/backoff/result/attempt/error) dan
 * circuitBreaker. Keduanya stateless di level modul -- instance dibuat per
 * panggilan/siklus (lihat scanner/index.ts), aman di serverless.
 *
 * Registry/manager/factory/recovery berbasis state di memori dipindah ke
 * _shadow/resilience/ (lihat README di sana).
 */

export { default as RetryExecutor } from "./retryExecutor";
export { DEFAULT_RETRY_POLICY, normalizeRetryPolicy } from "./retryPolicy";
export type { RetryPolicy } from "./retryPolicy";
export { RetryStrategy } from "./retryStrategy";
export { RetryError, RetryErrorCode } from "./retryError";
export { default as CircuitBreaker, CircuitBreakerOpenError } from "./circuitBreaker";
export { CircuitBreakerState } from "./circuitBreakerState";
