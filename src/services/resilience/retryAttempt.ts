/**
==========================================================
AURA Trade OS
Retry Attempt
Version : 0.0.8 Alpha
==========================================================
*/

export interface RetryAttempt {
    readonly attempt: number;
    readonly startedAt: number;
    readonly completedAt?: number;
    readonly delayMs: number;
    readonly success?: boolean;
    readonly error?: unknown;
}

export function createRetryAttempt(
    attempt: number,
    delayMs = 0,
): RetryAttempt {
    return {
        attempt,
        startedAt: Date.now(),
        delayMs,
    };
}
