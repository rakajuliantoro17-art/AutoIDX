/**
==========================================================
AURA Trade OS
Retry Error
Version : 0.0.8 Alpha
==========================================================
*/

export enum RetryErrorCode {
    MAX_ATTEMPTS =
        "RETRY_MAX_ATTEMPTS",

    NON_RETRYABLE =
        "RETRY_NON_RETRYABLE",

    INVALID_POLICY =
        "RETRY_INVALID_POLICY",

    EXECUTION_FAILED =
        "RETRY_EXECUTION_FAILED",
}

export class RetryError extends Error {
    public readonly code: RetryErrorCode;

    public readonly attempts: number;

    public readonly cause?: unknown;

    public constructor(
        message: string,
        options: {
            readonly code?: RetryErrorCode;
            readonly attempts?: number;
            readonly cause?: unknown;
        } = {},
    ) {
        super(message);

        this.name = "RetryError";

        this.code =
            options.code ??
            RetryErrorCode.EXECUTION_FAILED;

        this.attempts =
            options.attempts ?? 0;

        this.cause =
            options.cause;
    }
}

export default RetryError;
