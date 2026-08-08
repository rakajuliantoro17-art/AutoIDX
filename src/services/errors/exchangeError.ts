/**
==========================================================
AURA Trade OS
Exchange Error
Version : 0.0.7 Alpha
==========================================================
Exchange-specific Error Model
==========================================================
*/

import {
    AURAError,
} from "./error";

import type {
    ErrorContext,
} from "./errorContext";

import type {
    ErrorMetadata,
} from "./errorMetadata";

import {
    ErrorSeverity,
} from "./errorSeverity";

import type {
    ErrorCode,
} from "./errorCode";


/*
==========================================================
 Exchange Error Options
==========================================================
*/

export interface ExchangeErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Exchange identifier.
     *
     * Example:
     * indodax
     */
    readonly exchange?:
        string;

    /**
     * Trading pair.
     *
     * Example:
     * btc_idr
     */
    readonly pair?:
        string;

    /**
     * Exchange operation.
     *
     * Example:
     * placeOrder
     */
    readonly operation?:
        string;

    /**
     * Exchange-provided error code.
     */
    readonly exchangeCode?:
        string |
        number;

    /**
     * Exchange-provided error message.
     */
    readonly exchangeMessage?:
        string;

    /**
     * HTTP status code.
     */
    readonly httpStatus?:
        number;

    /**
     * HTTP status text.
     */
    readonly httpStatusText?:
        string;

    /**
     * Request ID returned by exchange.
     */
    readonly requestId?:
        string;

    /**
     * Correlation ID.
     */
    readonly correlationId?:
        string;

    /**
     * Whether the operation can be retried.
     */
    readonly retryable?:
        boolean;

    /**
     * Retry delay.
     */
    readonly retryAfterMs?:
        number;

    /**
     * Maximum retry count.
     */
    readonly maxRetries?:
        number;

    /**
     * Whether the error is caused by rate limiting.
     */
    readonly rateLimited?:
        boolean;

    /**
     * Whether authentication failed.
     */
    readonly authenticationFailure?:
        boolean;

    /**
     * Whether exchange rejected the order.
     */
    readonly orderRejected?:
        boolean;

    /**
     * Whether insufficient balance caused the error.
     */
    readonly insufficientBalance?:
        boolean;

    /**
     * Additional context.
     */
    readonly context?:
        ErrorContext;

    /**
     * Additional metadata.
     */
    readonly metadata?:
        ErrorMetadata;

    /**
     * Original cause.
     */
    readonly cause?:
        unknown;

}


/*
==========================================================
 Exchange Error
==========================================================
*/

export class ExchangeError
    extends AURAError {

    /*
    ======================================================
    Exchange
    ======================================================
    */

    public readonly exchange:
        string | undefined;


    /*
    ======================================================
    Pair
    ======================================================
    */

    public readonly pair:
        string | undefined;


    /*
    ======================================================
    Operation
    ======================================================
    */

    public readonly operation:
        string | undefined;


    /*
    ======================================================
    Exchange Code
    ======================================================
    */

    public readonly exchangeCode:
        string | number | undefined;


    /*
    ======================================================
    HTTP Status
    ======================================================
    */

    public readonly httpStatus:
        number | undefined;


    /*
    ======================================================
    HTTP Status Text
    ======================================================
    */

    public readonly httpStatusText:
        string | undefined;


    /*
    ======================================================
    Request ID
    ======================================================
    */

    public readonly requestId:
        string | undefined;


    /*
    ======================================================
    Correlation ID
    ======================================================
    */

    public readonly correlationId:
        string | undefined;


    /*
    ======================================================
    Retryable
    ======================================================
    */

    public readonly retryable:
        boolean;


    /*
    ======================================================
    Retry After
    ======================================================
    */

    public readonly retryAfterMs:
        number | undefined;


    /*
    ======================================================
    Max Retries
    ======================================================
    */

    public readonly maxRetries:
        number | undefined;


    /*
    ======================================================
    Rate Limited
    ======================================================
    */

    public readonly rateLimited:
        boolean;


    /*
    ======================================================
    Authentication Failure
    ======================================================
    */

    public readonly authenticationFailure:
        boolean;


    /*
    ======================================================
    Order Rejected
    ======================================================
    */

    public readonly orderRejected:
        boolean;


    /*
    ======================================================
    Insufficient Balance
    ======================================================
    */

    public readonly insufficientBalance:
        boolean;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        message:
            string,
        options:
            ExchangeErrorOptions = {},
    ) {

        const severity =
            ExchangeError.resolveSeverity(
                options,
            );


        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                "exchange",

            service:
                options.context?.service ??
                "exchange-service",

            exchange:
                options.exchange ??
                options.context?.exchange,

            pair:
                options.pair ??
                options.context?.pair,

            operation:
                options.operation ??
                options.context?.operation,

            requestId:
                options.requestId ??
                options.context?.requestId,

            correlationId:
                options.correlationId ??
                options.context?.correlationId,

            httpStatus:
                options.httpStatus ??
                options.context?.httpStatus,

        };


        const metadata:
            ErrorMetadata = {

            ...(options.metadata ?? {}),

            exchange:
                options.exchange ??
                options.metadata?.exchange,

            pair:
                options.pair ??
                options.metadata?.pair,

            operation:
                options.operation ??
                options.metadata?.operation,

            exchangeCode:
                options.exchangeCode ??
                options.metadata?.exchangeCode,

            retryable:
                options.retryable ??
                options.metadata?.retryable,

            retryAfterMs:
                options.retryAfterMs ??
                options.metadata?.retryAfterMs,

            maxRetries:
                options.maxRetries ??
                options.metadata?.maxRetries,

            rateLimited:
                options.rateLimited ??
                options.metadata?.rateLimited,

        };


        super(
            message,
            {

                code:
                    options.code,

                severity,

                context,

                metadata,

                cause:
                    options.cause,

            },
        );


        this.name =
            "ExchangeError";


        this.exchange =
            options.exchange;


        this.pair =
            options.pair;


        this.operation =
            options.operation;


        this.exchangeCode =
            options.exchangeCode;


        this.httpStatus =
            options.httpStatus;


        this.httpStatusText =
            options.httpStatusText;


        this.requestId =
            options.requestId;


        this.correlationId =
            options.correlationId;


        this.retryable =
            options.retryable ??
            ExchangeError.defaultRetryable(
                options,
            );


        this.retryAfterMs =
            options.retryAfterMs;


        this.maxRetries =
            options.maxRetries;


        this.rateLimited =
            options.rateLimited ??
            ExchangeError.detectRateLimit(
                options,
            );


        this.authenticationFailure =
            options.authenticationFailure ??
            ExchangeError.detectAuthenticationFailure(
                options,
            );


        this.orderRejected =
            options.orderRejected ??
            false;


        this.insufficientBalance =
            options.insufficientBalance ??
            false;

    }


    /*
    ======================================================
    Resolve Severity
    ======================================================
    */

    private static resolveSeverity(
        options:
            ExchangeErrorOptions,
    ): ErrorSeverity {

        if (
            options.authenticationFailure
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.rateLimited
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.insufficientBalance
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.orderRejected
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.httpStatus &&
            options.httpStatus >= 500
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.httpStatus &&
            options.httpStatus >= 400
        ) {

            return ErrorSeverity.ERROR;

        }


        return ErrorSeverity.ERROR;

    }


    /*
    ======================================================
    Default Retryable
    ======================================================
    */

    private static defaultRetryable(
        options:
            ExchangeErrorOptions,
    ): boolean {

        if (
            options.authenticationFailure
        ) {

            return false;

        }


        if (
            options.insufficientBalance
        ) {

            return false;

        }


        if (
            options.orderRejected
        ) {

            return false;

        }


        if (
            options.rateLimited
        ) {

            return true;

        }


        if (
            options.httpStatus &&
            options.httpStatus >= 500
        ) {

            return true;

        }


        if (
            options.httpStatus === 408 ||
            options.httpStatus === 429
        ) {

            return true;

        }


        return false;

    }


    /*
    ======================================================
    Detect Rate Limit
    ======================================================
    */

    private static detectRateLimit(
        options:
            ExchangeErrorOptions,
    ): boolean {

        if (
            options.httpStatus === 429
        ) {

            return true;

        }


        if (
            options.exchangeCode
        ) {

            const code =
                String(
                    options.exchangeCode,
                ).toLowerCase();


            if (
                code.includes(
                    "rate",
                ) ||
                code.includes(
                    "limit",
                ) ||
                code.includes(
                    "too_many",
                )
            ) {

                return true;

            }

        }


        const message =
            options.exchangeMessage ??
            "";


        return (
            /rate.?limit/i.test(
                message,
            ) ||
            /too many requests/i.test(
                message,
            )
        );

    }


    /*
    ======================================================
    Detect Authentication Failure
    ======================================================
    */

    private static detectAuthenticationFailure(
        options:
            ExchangeErrorOptions,
    ): boolean {

        if (
            options.httpStatus === 401 ||
            options.httpStatus === 403
        ) {

            return true;

        }


        const message =
            options.exchangeMessage ??
            "";


        return (
            /unauthorized/i.test(
                message,
            ) ||
            /authentication/i.test(
                message,
            ) ||
            /invalid.?api.?key/i.test(
                message,
            ) ||
            /invalid.?signature/i.test(
                message,
            )
        );

    }


    /*
    ======================================================
    Is Rate Limited
    ======================================================
    */

    public isRateLimited():
        boolean {

        return this.rateLimited;

    }


    /*
    ======================================================
    Is Retryable
    ======================================================
    */

    public isRetryable():
        boolean {

        return this.retryable;

    }


    /*
    ======================================================
    Is Authentication Failure
    ======================================================
    */

    public isAuthenticationFailure():
        boolean {

        return this.authenticationFailure;

    }


    /*
    ======================================================
    Is Order Rejected
    ======================================================
    */

    public isOrderRejected():
        boolean {

        return this.orderRejected;

    }


    /*
    ======================================================
    Is Insufficient Balance
    ======================================================
    */

    public isInsufficientBalance():
        boolean {

        return this.insufficientBalance;

    }


    /*
    ======================================================
    Has HTTP Status
    ======================================================
    */

    public hasHttpStatus(
        status:
            number,
    ): boolean {

        return (
            this.httpStatus ===
            status
        );

    }


    /*
    ======================================================
    Is Server Error
    ======================================================
    */

    public isServerError():
        boolean {

        return (
            this.httpStatus !==
                undefined &&
            this.httpStatus >=
                500
        );

    }


    /*
    ======================================================
    Is Client Error
    ======================================================
    */

    public isClientError():
        boolean {

        return (
            this.httpStatus !==
                undefined &&
            this.httpStatus >=
                400 &&
            this.httpStatus < 500
        );

    }


    /*
    ======================================================
    Get Exchange Identifier
    ======================================================
    */

    public getExchange():
        string | undefined {

        return this.exchange;

    }


    /*
    ======================================================
    Get Pair
    ======================================================
    */

    public getPair():
        string | undefined {

        return this.pair;

    }


    /*
    ======================================================
    Get Operation
    ======================================================
    */

    public getOperation():
        string | undefined {

        return this.operation;

    }


    /*
    ======================================================
    Get Retry Delay
    ======================================================
    */

    public getRetryDelay():
        number | undefined {

        return this.retryAfterMs;

    }


    /*
    ======================================================
    To Exchange Object
    ======================================================
    */

    public toExchangeObject():
        ExchangeErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            exchange:
                this.exchange,

            pair:
                this.pair,

            operation:
                this.operation,

            exchangeCode:
                this.exchangeCode,

            httpStatus:
                this.httpStatus,

            httpStatusText:
                this.httpStatusText,

            requestId:
                this.requestId,

            correlationId:
                this.correlationId,

            retryable:
                this.retryable,

            retryAfterMs:
                this.retryAfterMs,

            maxRetries:
                this.maxRetries,

            rateLimited:
                this.rateLimited,

            authenticationFailure:
                this.authenticationFailure,

            orderRejected:
                this.orderRejected,

            insufficientBalance:
                this.insufficientBalance,

        };

    }


    /*
    ======================================================
    Static From Error
    ======================================================
    */

    public static from(
        error:
            unknown,
        options:
            ExchangeErrorOptions = {},
    ): ExchangeError {

        if (
            error instanceof
            ExchangeError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            return new ExchangeError(
                error.message,
                {

                    ...options,

                    cause:
                        error,

                },
            );

        }


        if (
            typeof error ===
            "string"
        ) {

            return new ExchangeError(
                error,
                options,
            );

        }


        return new ExchangeError(
            "Unknown exchange error",
            options,
        );

    }


    /*
    ======================================================
    Static Rate Limit
    ======================================================
    */

    public static rateLimit(
        message:
            string =
                "Exchange rate limit exceeded.",
        options:
            Omit<
                ExchangeErrorOptions,
                "rateLimited"
            > = {},
    ): ExchangeError {

        return new ExchangeError(
            message,
            {

                ...options,

                rateLimited:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Static Authentication
    ======================================================
    */

    public static authentication(
        message:
            string =
                "Exchange authentication failed.",
        options:
            Omit<
                ExchangeErrorOptions,
                "authenticationFailure"
            > = {},
    ): ExchangeError {

        return new ExchangeError(
            message,
            {

                ...options,

                authenticationFailure:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Static OrderRejected
    ======================================================
    */

    public static orderRejectedError(
        message:
            string =
                "Exchange rejected the order.",
        options:
            Omit<
                ExchangeErrorOptions,
                "orderRejected"
            > = {},
    ): ExchangeError {

        return new ExchangeError(
            message,
            {

                ...options,

                orderRejected:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Static Insufficient Balance
    ======================================================
    */

    public static insufficientBalanceError(
        message:
            string =
                "Insufficient exchange balance.",
        options:
            Omit<
                ExchangeErrorOptions,
                "insufficientBalance"
            > = {},
    ): ExchangeError {

        return new ExchangeError(
            message,
            {

                ...options,

                insufficientBalance:
                    true,

                retryable:
                    false,

            },
        );

    }

}


/*
==========================================================
 Serialized Exchange Error
==========================================================
*/

export interface ExchangeErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly exchange?:
        string;

    readonly pair?:
        string;

    readonly operation?:
        string;

    readonly exchangeCode?:
        string | number;

    readonly httpStatus?:
        number;

    readonly httpStatusText?:
        string;

    readonly requestId?:
        string;

    readonly correlationId?:
        string;

    readonly retryable:
        boolean;

    readonly retryAfterMs?:
        number;

    readonly maxRetries?:
        number;

    readonly rateLimited:
        boolean;

    readonly authenticationFailure:
        boolean;

    readonly orderRejected:
        boolean;

    readonly insufficientBalance:
        boolean;

}


/*
==========================================================
 Factory Functions
==========================================================
*/

export function createExchangeError(
    message:
        string,
    options:
        ExchangeErrorOptions = {},
): ExchangeError {

    return new ExchangeError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize Exchange Error
==========================================================
*/

export function normalizeExchangeError(
    error:
        unknown,
    options:
        ExchangeErrorOptions = {},
): ExchangeError {

    return ExchangeError.from(
        error,
        options,
    );

}


/*
==========================================================
 Rate Limit Factory
==========================================================
*/

export function createExchangeRateLimitError(
    options:
        Omit<
            ExchangeErrorOptions,
            "rateLimited"
        > = {},
): ExchangeError {

    return ExchangeError.rateLimit(
        "Exchange rate limit exceeded.",
        options,
    );

}


/*
==========================================================
 Authentication Factory
==========================================================
*/

export function createExchangeAuthenticationError(
    options:
        Omit<
            ExchangeErrorOptions,
            "authenticationFailure"
        > = {},
): ExchangeError {

    return ExchangeError.authentication(
        "Exchange authentication failed.",
        options,
    );

}


/*
==========================================================
 Order Rejection Factory
==========================================================
*/

export function createExchangeOrderRejectedError(
    options:
        Omit<
            ExchangeErrorOptions,
            "orderRejected"
        > = {},
): ExchangeError {

    return ExchangeError.orderRejectedError(
        "Exchange rejected the order.",
        options,
    );

}


/*
==========================================================
 Insufficient Balance Factory
==========================================================
*/

export function createExchangeInsufficientBalanceError(
    options:
        Omit<
            ExchangeErrorOptions,
            "insufficientBalance"
        > = {},
): ExchangeError {

    return ExchangeError.insufficientBalanceError(
        "Insufficient exchange balance.",
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isExchangeError(
    error:
        unknown,
): error is ExchangeError {

    return (
        error instanceof
        ExchangeError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ExchangeError;
