/**
==========================================================
AURA Trade OS
Backoff Calculator
Version : 0.0.8 Alpha
==========================================================
*/

import {
    BackoffStrategy,
} from "./backoffStrategy";

export interface BackoffOptions {
    readonly baseDelayMs: number;
    readonly maxDelayMs?: number;
    readonly multiplier?: number;
    readonly strategy?:
        BackoffStrategy;
    readonly jitter?: boolean;
}

export function calculateBackoff(
    attempt: number,
    options: BackoffOptions,
): number {
    const {
        baseDelayMs,
        maxDelayMs = Infinity,
        multiplier = 2,
        strategy =
            BackoffStrategy.EXPONENTIAL,
        jitter = false,
    } = options;

    const safeAttempt =
        Math.max(1, attempt);

    let delay: number;

    switch (strategy) {
        case BackoffStrategy.NONE:
            delay = 0;
            break;

        case BackoffStrategy.FIXED:
            delay = baseDelayMs;
            break;

        case BackoffStrategy.LINEAR:
            delay =
                baseDelayMs *
                safeAttempt;
            break;

        case BackoffStrategy.EXPONENTIAL:
        case BackoffStrategy.EXPONENTIAL_JITTER:
            delay =
                baseDelayMs *
                Math.pow(
                    multiplier,
                    safeAttempt - 1,
                );
            break;

        default:
            delay = baseDelayMs;
    }

    delay = Math.min(
        delay,
        maxDelayMs,
    );

    if (
        jitter ||
        strategy ===
            BackoffStrategy.EXPONENTIAL_JITTER
    ) {
        delay =
            Math.random() * delay;
    }

    return Math.max(
        0,
        Math.floor(delay),
    );
}

export function sleep(
    milliseconds: number,
): Promise<void> {
    if (milliseconds <= 0) {
        return Promise.resolve();
    }

    return new Promise(
        (resolve) =>
            setTimeout(
                resolve,
                milliseconds,
            ),
    );
}
