/**
==========================================================
AURA Trade OS
Transaction Error
Version : 0.0.7 Alpha
==========================================================
*/

export enum TransactionErrorCode {
    UNKNOWN = "TRANSACTION_UNKNOWN",
    INVALID_STATE = "TRANSACTION_INVALID_STATE",
    NOT_FOUND = "TRANSACTION_NOT_FOUND",
    ALREADY_EXISTS = "TRANSACTION_ALREADY_EXISTS",
    EXECUTION_FAILED = "TRANSACTION_EXECUTION_FAILED",
    CANCELLED = "TRANSACTION_CANCELLED",
    EXPIRED = "TRANSACTION_EXPIRED",
    ROLLBACK_FAILED = "TRANSACTION_ROLLBACK_FAILED",
}

export class TransactionError
    extends Error {

    public readonly code:
        TransactionErrorCode;

    public readonly transactionId?:
        string;

    public readonly cause?:
        unknown;

    public constructor(
        message: string,
        options: {
            readonly code?:
                TransactionErrorCode;

            readonly transactionId?:
                string;

            readonly cause?:
                unknown;
        } = {},
    ) {
        super(message);

        this.name =
            "TransactionError";

        this.code =
            options.code ??
            TransactionErrorCode.UNKNOWN;

        this.transactionId =
            options.transactionId;

        this.cause =
            options.cause;
    }
}

export default TransactionError;
