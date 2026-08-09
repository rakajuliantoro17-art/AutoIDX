/**
==========================================================
AURA Trade OS
Bus Result
Version : 0.0.7 Alpha
==========================================================
*/

export interface BusResult<T = unknown> {
    readonly success: boolean;

    readonly messageId: string;

    readonly handlerName?: string;

    readonly data?: T;

    readonly error?: unknown;

    readonly durationMs: number;

    readonly timestamp: number;
}

export function createBusSuccess<T = unknown>(
    messageId: string,
    data?: T,
    options: {
        readonly handlerName?: string;
        readonly durationMs?: number;
    } = {},
): BusResult<T> {
    return {
        success: true,

        messageId,

        handlerName:
            options.handlerName,

        data,

        durationMs:
            options.durationMs ??
            0,

        timestamp:
            Date.now(),
    };
}

export function createBusFailure(
    messageId: string,
    error: unknown,
    options: {
        readonly handlerName?: string;
        readonly durationMs?: number;
    } = {},
): BusResult {
    return {
        success: false,

        messageId,

        handlerName:
            options.handlerName,

        error,

        durationMs:
            options.durationMs ??
            0,

        timestamp:
            Date.now(),
    };
}
