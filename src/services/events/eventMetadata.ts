/**
==========================================================
AURA Trade OS
Event Metadata
Version : 0.0.7 Alpha
==========================================================
*/

export interface EventMetadata {
    readonly source?: string;
    readonly service?: string;
    readonly module?: string;

    readonly symbol?: string;
    readonly pair?: string;
    readonly exchange?: string;

    readonly strategyId?: string;
    readonly signalId?: string;
    readonly orderId?: string;
    readonly positionId?: string;

    readonly requestId?: string;
    readonly correlationId?: string;
    readonly causationId?: string;

    readonly timestamp?: number;

    readonly [key: string]: unknown;
}

export function createEventMetadata(
    metadata: EventMetadata = {},
): EventMetadata {
    return {
        ...metadata,
        timestamp:
            metadata.timestamp ??
            Date.now(),
    };
}
