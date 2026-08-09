/**
==========================================================
AURA Trade OS
Transaction Metadata
Version : 0.0.7 Alpha
==========================================================
*/

export interface TransactionMetadata {
    readonly source?: string;

    readonly strategyId?: string;

    readonly symbol?: string;

    readonly side?: string;

    readonly accountId?: string;

    readonly userId?: string;

    readonly tags:
        readonly string[];

    readonly values:
        Record<string, unknown>;
}

export function createTransactionMetadata(
    options: {
        readonly source?: string;
        readonly strategyId?: string;
        readonly symbol?: string;
        readonly side?: string;
        readonly accountId?: string;
        readonly userId?: string;
        readonly tags?: readonly string[];
        readonly values?: Record<string, unknown>;
    } = {},
): TransactionMetadata {
    return {
        source:
            options.source,

        strategyId:
            options.strategyId,

        symbol:
            options.symbol,

        side:
            options.side,

        accountId:
            options.accountId,

        userId:
            options.userId,

        tags:
            options.tags ?? [],

        values:
            options.values ?? {},
    };
}
