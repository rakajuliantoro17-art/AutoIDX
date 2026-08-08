/**
==========================================================
AURA Trade OS
Command Metadata
Version : 0.0.7 Alpha
==========================================================
*/

export interface CommandMetadata {
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

    readonly userId?: string;

    readonly timestamp?: number;

    readonly [key: string]: unknown;
}


export function createCommandMetadata(
    metadata: CommandMetadata = {},
): CommandMetadata {
    return {
        ...metadata,
        timestamp:
            metadata.timestamp ??
            Date.now(),
    };
}
