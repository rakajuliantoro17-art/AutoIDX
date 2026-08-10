/**
==========================================================
AURA Trade OS
Circuit Breaker Config
Version : 0.0.8 Alpha
==========================================================
*/

export interface CircuitBreakerConfig {
    readonly failureThreshold: number;
    readonly resetTimeoutMs: number;
    readonly halfOpenMaxAttempts: number;
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG:
    CircuitBreakerConfig = {
    failureThreshold: 5,
    resetTimeoutMs: 30_000,
    halfOpenMaxAttempts: 1,
};

export function normalizeCircuitBreakerConfig(
    config?: Partial<
        CircuitBreakerConfig
    >,
): CircuitBreakerConfig {
    return {
        ...DEFAULT_CIRCUIT_BREAKER_CONFIG,
        ...config,

        failureThreshold:
            Math.max(
                1,
                config?.failureThreshold ??
                    DEFAULT_CIRCUIT_BREAKER_CONFIG.failureThreshold,
            ),

        resetTimeoutMs:
            Math.max(
                0,
                config?.resetTimeoutMs ??
                    DEFAULT_CIRCUIT_BREAKER_CONFIG.resetTimeoutMs,
            ),

        halfOpenMaxAttempts:
            Math.max(
                1,
                config?.halfOpenMaxAttempts ??
                    DEFAULT_CIRCUIT_BREAKER_CONFIG.halfOpenMaxAttempts,
            ),
    };
}
