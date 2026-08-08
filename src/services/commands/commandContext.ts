/**
==========================================================
AURA Trade OS
Command Context
Version : 0.0.7 Alpha
==========================================================
*/

export interface CommandContext {
    readonly commandId?: string;

    readonly requestId?: string;
    readonly correlationId?: string;
    readonly causationId?: string;

    readonly source?: string;
    readonly service?: string;
    readonly module?: string;

    readonly timestamp?: number;

    readonly [key: string]: unknown;
}


export function createCommandContext(
    context: CommandContext = {},
): CommandContext {
    return {
        ...context,
        timestamp:
            context.timestamp ??
            Date.now(),
    };
}
