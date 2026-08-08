/**
==========================================================
AURA Trade OS
Event Context
Version : 0.0.7 Alpha
==========================================================
Event Contextual Metadata
==========================================================
*/

export interface EventContext {

    readonly source?: string;

    readonly correlationId?: string;

    readonly userId?: string;

    [key: string]: unknown;

}

export function createEventContext(
    data?: Partial<EventContext>,
): EventContext {
    return {
        ...data,
    };
}
