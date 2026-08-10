/**
==========================================================
AURA Trade OS
Recovery Policy
Version : 0.0.8 Alpha
==========================================================
*/

export enum RecoveryAction {
    RETRY = "RETRY",
    ROLLBACK = "ROLLBACK",
    CANCEL = "CANCEL",
    RECONNECT = "RECONNECT",
    RESET = "RESET",
    FAIL = "FAIL",
}

export interface RecoveryPolicy {
    readonly actions:
        readonly RecoveryAction[];

    readonly maxRecoveries: number;

    readonly recoverableErrors:
        readonly string[];
}

export const DEFAULT_RECOVERY_POLICY:
    RecoveryPolicy = {
    actions: [
        RecoveryAction.RETRY,
        RecoveryAction.RECONNECT,
        RecoveryAction.RESET,
    ],

    maxRecoveries: 2,

    recoverableErrors: [],
};

export function normalizeRecoveryPolicy(
    policy?: Partial<
        RecoveryPolicy
    >,
): RecoveryPolicy {
    return {
        ...DEFAULT_RECOVERY_POLICY,
        ...policy,

        actions:
            policy?.actions ??
            DEFAULT_RECOVERY_POLICY.actions,

        maxRecoveries:
            Math.max(
                1,
                policy?.maxRecoveries ??
                    DEFAULT_RECOVERY_POLICY.maxRecoveries,
            ),

        recoverableErrors:
            policy?.recoverableErrors ??
            DEFAULT_RECOVERY_POLICY.recoverableErrors,
    };
}
