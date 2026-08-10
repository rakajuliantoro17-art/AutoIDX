/**
==========================================================
AURA Trade OS
Recovery Manager
Version : 0.0.8 Alpha
==========================================================
*/

import {
    normalizeRecoveryPolicy,
    RecoveryAction,
    type RecoveryPolicy,
} from "./recoveryPolicy";

import {
    createRecoveryContext,
    type RecoveryContext,
} from "./recoveryContext";

export interface RecoveryHandler {
    readonly action: RecoveryAction;

    execute(
        context: RecoveryContext,
        error: unknown,
    ):
        void |
        Promise<void>;
}

export class RecoveryManager {
    private readonly handlers =
        new Map<
            RecoveryAction,
            RecoveryHandler
        >();

    public register(
        handler: RecoveryHandler,
    ): void {
        this.handlers.set(
            handler.action,
            handler,
        );
    }

    public async recover(
        error: unknown,
        options: {
            readonly transactionId?: string;
            readonly executionId?: string;
            readonly policy?:
                Partial<RecoveryPolicy>;
            readonly metadata?:
                Record<string, unknown>;
        } = {},
    ): Promise<{
        readonly success: boolean;
        readonly action?: RecoveryAction;
        readonly context: RecoveryContext;
        readonly error?: unknown;
    }> {
        const policy =
            normalizeRecoveryPolicy(
                options.policy,
            );

        const context =
            createRecoveryContext({
                recoveryId:
                    createRecoveryId(),

                transactionId:
                    options.transactionId,

                executionId:
                    options.executionId,

                policy,

                metadata:
                    options.metadata,
            });

        for (
            const action of
            policy.actions
        ) {
            const handler =
                this.handlers.get(
                    action,
                );

            if (!handler) {
                continue;
            }

            try {
                await handler.execute(
                    context,
                    error,
                );

                return {
                    success: true,
                    action,
                    context: {
                        ...context,
                        attempts:
                            context.attempts +
                            1,
                    },
                };
            } catch {
                // Continue with next recovery action.
            }
        }

        return {
            success: false,
            context,
            error,
        };
    }
}

export function createRecoveryId(): string {
    return [
        "recovery",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}

export const recoveryManager =
    new RecoveryManager();

export default RecoveryManager;
