/**
==========================================================
AURA Trade OS
Transaction Result
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionStatus,
} from "./transactionStatus";

export interface TransactionResult<T = unknown> {
    readonly success: boolean;

    readonly transactionId: string;

    readonly status: TransactionStatus;

    readonly data?: T;

    readonly error?: unknown;

    readonly startedAt: number;

    readonly completedAt?: number;

    readonly durationMs?: number;

    readonly metadata:
        Record<string, unknown>;
}

export function createTransactionSuccess<T>(
    transactionId: string,
    data?: T,
    options: {
        readonly status?:
            TransactionStatus;

        readonly startedAt?: number;

        readonly metadata?:
            Record<string, unknown>;
    } = {},
): TransactionResult<T> {
    const completedAt =
        Date.now();

    const startedAt =
        options.startedAt ??
        completedAt;

    return {
        success: true,

        transactionId,

        status:
            options.status ??
            TransactionStatus.COMPLETED,

        data,

        startedAt,

        completedAt,

        durationMs:
            completedAt -
            startedAt,

        metadata:
            options.metadata ?? {},
    };
}

export function createTransactionFailure(
    transactionId: string,
    error: unknown,
    options: {
        readonly status?:
            TransactionStatus;

        readonly startedAt?: number;

        readonly metadata?:
            Record<string, unknown>;
    } = {},
): TransactionResult {
    const completedAt =
        Date.now();

    const startedAt =
        options.startedAt ??
        completedAt;

    return {
        success: false,

        transactionId,

        status:
            options.status ??
            TransactionStatus.FAILED,

        error,

        startedAt,

        completedAt,

        durationMs:
            completedAt -
            startedAt,

        metadata:
            options.metadata ?? {},
    };
}
