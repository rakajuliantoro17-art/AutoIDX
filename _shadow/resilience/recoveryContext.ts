/**
==========================================================
AURA Trade OS
Recovery Context
Version : 0.0.8 Alpha
==========================================================
*/

import type {
    RecoveryPolicy,
} from "./recoveryPolicy";

export interface RecoveryContext {
    readonly recoveryId: string;
    readonly transactionId?: string;
    readonly executionId?: string;
    readonly policy: RecoveryPolicy;
    readonly startedAt: number;
    readonly attempts: number;
    readonly metadata:
        Record<string, unknown>;
}

export function createRecoveryContext(
    options: {
        readonly recoveryId: string;
        readonly policy: RecoveryPolicy;
        readonly transactionId?: string;
        readonly executionId?: string;
        readonly metadata?:
            Record<string, unknown>;
    },
): RecoveryContext {
    return {
        recoveryId:
            options.recoveryId,

        transactionId:
            options.transactionId,

        executionId:
            options.executionId,

        policy:
            options.policy,

        startedAt:
            Date.now(),

        attempts: 0,

        metadata:
            options.metadata ?? {},
    };
}
