/**
==========================================================
AURA Trade OS
Retry Strategy
Version : 0.0.8 Alpha
==========================================================
*/

export enum RetryStrategy {
    IMMEDIATE = "IMMEDIATE",
    FIXED = "FIXED",
    LINEAR = "LINEAR",
    EXPONENTIAL = "EXPONENTIAL",
    EXPONENTIAL_JITTER = "EXPONENTIAL_JITTER",
}

export function isRetryStrategy(
    value: unknown,
): value is RetryStrategy {
    return Object.values(
        RetryStrategy,
    ).includes(
        value as RetryStrategy,
    );
}
