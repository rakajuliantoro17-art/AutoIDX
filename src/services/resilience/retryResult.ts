/**
==========================================================
AURA Trade OS
Retry Result
Version : 0.0.9 Alpha

Perubahan dari 0.0.8: createRetryFailure() sekarang generic
<T>, konsisten dengan createRetrySuccess() -- sebelumnya
selalu RetryResult<unknown>, bikin type error waktu dipakai
di dalam fungsi generic execute<T>() (retryExecutor.ts).
==========================================================
*/

import type {
    RetryAttempt,
} from "./retryAttempt";

export interface RetryResult<T = unknown> {
    readonly success: boolean;
    readonly value?: T;
    readonly error?: unknown;
    readonly attempts: number;
    readonly durationMs: number;
    readonly history: readonly RetryAttempt[];
}

export function createRetrySuccess<T>(
    value: T,
    history: readonly RetryAttempt[],
    startedAt: number,
): RetryResult<T> {
    return {
        success: true,
        value,
        attempts: history.length,
        durationMs:
            Date.now() - startedAt,
        history,
    };
}

export function createRetryFailure<T = never>(
    error: unknown,
    history: readonly RetryAttempt[],
    startedAt: number,
): RetryResult<T> {
    return {
        success: false,
        error,
        attempts: history.length,
        durationMs:
            Date.now() - startedAt,
        history,
    };
}
