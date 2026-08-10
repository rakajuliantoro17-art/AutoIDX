/**
==========================================================
AURA Trade OS
Retry Policy
Version : 0.0.8 Alpha
==========================================================
*/

export interface RetryPolicy {
    readonly maxAttempts: number;
    readonly delayMs: number;
    readonly maxDelayMs: number;
    readonly multiplier: number;
    readonly jitter: boolean;
    readonly retryableErrors?: readonly string[];
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
    maxAttempts: 3,
    delayMs: 250,
    maxDelayMs: 10_000,
    multiplier: 2,
    jitter: true,
};

export function normalizeRetryPolicy(
    policy?: Partial<RetryPolicy>,
): RetryPolicy {
    return {
        ...DEFAULT_RETRY_POLICY,
        ...policy,
        maxAttempts: Math.max(
            1,
            policy?.maxAttempts ??
                DEFAULT_RETRY_POLICY.maxAttempts,
        ),
        delayMs: Math.max(
            0,
            policy?.delayMs ??
                DEFAULT_RETRY_POLICY.delayMs,
        ),
        maxDelayMs: Math.max(
            policy?.maxDelayMs ??
                DEFAULT_RETRY_POLICY.maxDelayMs,
            policy?.delayMs ??
                DEFAULT_RETRY_POLICY.delayMs,
        ),
        multiplier: Math.max(
            1,
            policy?.multiplier ??
                DEFAULT_RETRY_POLICY.multiplier,
        ),
    };
}
