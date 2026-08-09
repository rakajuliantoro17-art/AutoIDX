/**
==========================================================
AURA Trade OS
Bus Error
Version : 0.0.7 Alpha
==========================================================
*/

export enum BusErrorCode {
    UNKNOWN = "BUS_UNKNOWN",
    HANDLER_NOT_FOUND = "BUS_HANDLER_NOT_FOUND",
    DUPLICATE_HANDLER = "BUS_DUPLICATE_HANDLER",
    INVALID_MESSAGE = "BUS_INVALID_MESSAGE",
    DISPATCH_FAILED = "BUS_DISPATCH_FAILED",
    MIDDLEWARE_FAILED = "BUS_MIDDLEWARE_FAILED",
    QUEUE_FAILED = "BUS_QUEUE_FAILED",
    PROCESSING_FAILED = "BUS_PROCESSING_FAILED",
    TIMEOUT = "BUS_TIMEOUT",
}

export class BusError extends Error {
    public readonly code: BusErrorCode;

    public readonly messageId?: string;

    public readonly handlerName?: string;

    public readonly cause?: unknown;

    public constructor(
        message: string,
        options: {
            readonly code?: BusErrorCode;
            readonly messageId?: string;
            readonly handlerName?: string;
            readonly cause?: unknown;
        } = {},
    ) {
        super(message);

        this.name =
            "BusError";

        this.code =
            options.code ??
            BusErrorCode.UNKNOWN;

        this.messageId =
            options.messageId;

        this.handlerName =
            options.handlerName;

        this.cause =
            options.cause;
    }
}

export default BusError;
