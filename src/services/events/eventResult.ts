/**
==========================================================
AURA Trade OS
Event Result
Version : 0.0.7 Alpha
==========================================================
*/

export interface EventResult<T = unknown> {
    readonly success: boolean;

    readonly eventId?: string;

    readonly data?: T;

    readonly error?: unknown;

    readonly durationMs?: number;

    readonly timestamp: number;
}

export function createEventResult<T>(
    data?: T,
): EventResult<T> {
    return {
        success: true,
        data,
        timestamp: Date.now(),
    };
}

export function createFailedEventResult(
    error: unknown,
): EventResult {
    return {
        success: false,
        error,
        timestamp: Date.now(),
    };
}
