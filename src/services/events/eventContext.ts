/**
==========================================================
AURA Trade OS
Event Context
Version : 0.0.7 Alpha
==========================================================
*/

export interface EventContext {
    readonly eventId?: string;
    readonly correlationId?: string;
    readonly causationId?: string;

    readonly requestId?: string;

    readonly source?: string;
    readonly service?: string;
    readonly module?: string;

    readonly timestamp?: number;

    readonly [key: string]: unknown;
}

export function createEventContext(
    context: EventContext = {},
): EventContext {
    return {
        ...context,
        timestamp:
            context.timestamp ??
            Date.now(),
    };
}
