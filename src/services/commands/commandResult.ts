/**
==========================================================
AURA Trade OS
Command Result
Version : 0.0.7 Alpha
==========================================================
*/

import {
    CommandStatus,
} from "./commandStatus";


export interface CommandResult<T = unknown> {
    readonly success: boolean;

    readonly commandId?: string;

    readonly status?: CommandStatus;

    readonly data?: T;

    readonly error?: unknown;

    readonly durationMs?: number;

    readonly timestamp: number;
}


export function createCommandResult<T>(
    data?: T,
): CommandResult<T> {
    return {
        success: true,
        status: CommandStatus.COMPLETED,
        data,
        timestamp: Date.now(),
    };
}


export function createFailedCommandResult(
    error: unknown,
): CommandResult {
    return {
        success: false,
        status: CommandStatus.FAILED,
        error,
        timestamp: Date.now(),
    };
}


export function createRejectedCommandResult(
    error: unknown,
): CommandResult {
    return {
        success: false,
        status: CommandStatus.REJECTED,
        error,
        timestamp: Date.now(),
    };
}
