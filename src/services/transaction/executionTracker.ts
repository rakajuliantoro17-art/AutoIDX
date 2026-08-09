/**
==========================================================
AURA Trade OS
Execution Tracker
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    ExecutionContext,
} from "./executionContext";

export interface ExecutionRecord {
    readonly executionId: string;

    readonly transactionId: string;

    readonly startedAt: number;

    readonly completedAt?: number;

    readonly success?: boolean;

    readonly error?: unknown;

    readonly metadata:
        Record<string, unknown>;
}

export class ExecutionTracker {
    private readonly records:
        Map<
            string,
            ExecutionRecord
        > =
        new Map();

    public start(
        context:
            ExecutionContext,
    ): ExecutionRecord {
        const record:
            ExecutionRecord = {
            executionId:
                context.executionId,

            transactionId:
                context.transactionId,

            startedAt:
                context.startedAt,

            metadata:
                {
                    ...context.metadata
                        .values,
                },
        };

        this.records.set(
            record.executionId,
            record,
        );

        return record;
    }

    public complete(
        executionId: string,
        success: boolean,
        options: {
            readonly error?: unknown;

            readonly metadata?:
                Record<string, unknown>;
        } = {},
    ): ExecutionRecord | undefined {
        const current =
            this.records.get(
                executionId,
            );

        if (!current) {
            return undefined;
        }

        const updated:
            ExecutionRecord = {
            ...current,

            completedAt:
                Date.now(),

            success,

            error:
                options.error,

            metadata: {
                ...current.metadata,

                ...options.metadata,
            },
        };

        this.records.set(
            executionId,
            updated,
        );

        return updated;
    }

    public get(
        executionId: string,
    ):
        ExecutionRecord |
        undefined {
        return this.records.get(
            executionId,
        );
    }

    public list():
        readonly ExecutionRecord[] {
        return [
            ...this.records.values(),
        ];
    }

    public remove(
        executionId: string,
    ): boolean {
        return this.records.delete(
            executionId,
        );
    }

    public clear(): void {
        this.records.clear();
    }

    public size(): number {
        return this.records.size;
    }
}

export const executionTracker =
    new ExecutionTracker();

export default ExecutionTracker;
