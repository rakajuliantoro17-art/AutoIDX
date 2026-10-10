/**
==========================================================
AURA Trade OS
Network Error
Version : 0.0.7 Alpha
==========================================================
Network-specific Error Model
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
 Network Error Options
==========================================================
*/

export interface NetworkErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Network operation.
     *
     * Example:
     * connect
     * request
     * upload
     * download
     * websocket
     */
    readonly operation?:
        string;

    /**
     * Protocol.
     *
     * Example:
     * HTTP
     * HTTPS
     * WS
     * WSS
     * TCP
     */
    readonly protocol?:
        string;

    /**
     * Hostname.
     */
    readonly host?:
        string;

    /**
     * Port.
     */
    readonly port?:
        number;

    /**
     * URL.
     */
    readonly url?:
        string;

    /**
     * HTTP method.
     */
    readonly method?:
        string;

    /**
     * HTTP status code.
     */
    readonly statusCode?:
        number;

    /**
     * Network error code.
     *
     * Example:
     * ECONNRESET
     * ECONNREFUSED
     * ETIMEDOUT
     * ENOTFOUND
     */
    readonly networkCode?:
        string;

    /**
     * Request ID.
     */
    readonly requestId?:
        string;

    /**
     * Correlation ID.
     */
    readonly correlationId?:
        string;

    /**
     * Timeout duration.
     */
    readonly timeoutMs?:
        number;

    /**
     * Retry count.
     */
    readonly retryCount?:
        number;

    /**
     * Maximum retry count.
     */
    readonly maxRetries?:
        number;

    /**
     * Retry delay.
     */
    readonly retryAfterMs?:
        number;

    /**
     * Whether the error is retryable.
     */
    readonly retryable?:
        boolean;

    /**
     * Connection failed.
     */
    readonly connectionFailed?:
        boolean;

    /**
     * Connection reset.
     */
    readonly connectionReset?:
        boolean;

    /**
     * Connection refused.
     */
    readonly connectionRefused?:
        boolean;

    /**
     * DNS resolution failed.
     */
    readonly dnsFailure?:
        boolean;

    /**
     * Timeout.
     */
    readonly timeout?:
        boolean;

    /**
     * HTTP/network response failure.
     */
    readonly responseFailure?:
        boolean;

    /**
     * TLS/SSL failure.
     */
    readonly tlsFailure?:
        boolean;

    /**
     * Rate limit encountered.
     */
    readonly rateLimited?:
        boolean;

    /**
     * Network unavailable.
     */
    readonly networkUnavailable?:
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
     * Original error.
     */
    readonly cause?:
        unknown;

}


/*
==========================================================
 Network Error
==========================================================
*/

export class NetworkError
    extends AURAError {

    /*
    ======================================================
    Operation
    ======================================================
    */

    public readonly operation:
        string | undefined;


    /*
    ======================================================
    Protocol
    ======================================================
    */

    public readonly protocol:
        string | undefined;


    /*
    ======================================================
    Host
    ======================================================
    */

    public readonly host:
        string | undefined;


    /*
    ======================================================
    Port
    ======================================================
    */

    public readonly port:
        number | undefined;


    /*
    ======================================================
    URL
    ======================================================
    */

    public readonly url:
        string | undefined;


    /*
    ======================================================
    Method
    ======================================================
    */

    public readonly method:
        string | undefined;


    /*
    ======================================================
    Status Code
    ======================================================
    */

    public readonly statusCode:
        number | undefined;


    /*
    ======================================================
    Network Code
    ======================================================
    */

    public readonly networkCode:
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
    Timeout
    ======================================================
    */

    public readonly timeoutMs:
        number | undefined;


    /*
    ======================================================
    Retry Count
    ======================================================
    */

    public readonly retryCount:
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
    Retry After
    ======================================================
    */

    public readonly retryAfterMs:
        number | undefined;


    /*
    ======================================================
    Retryable
    ======================================================
    */

    public readonly retryable:
        boolean;


    /*
    ======================================================
    Connection Failed
    ======================================================
    */

    public readonly connectionFailed:
        boolean;


    /*
    ======================================================
    Connection Reset
    ======================================================
    */

    public readonly connectionReset:
        boolean;


    /*
    ======================================================
    Connection Refused
    ======================================================
    */

    public readonly connectionRefused:
        boolean;


    /*
    ======================================================
    DNS Failure
    ======================================================
    */

    public readonly dnsFailure:
        boolean;


    /*
    ======================================================
    Timeout Flag
    ======================================================
    */

    public readonly timeout:
        boolean;


    /*
    ======================================================
    Response Failure
    ======================================================
    */

    public readonly responseFailure:
        boolean;


    /*
    ======================================================
    TLS Failure
    ======================================================
    */

    public readonly tlsFailure:
        boolean;


    /*
    ======================================================
    Rate Limited
    ======================================================
    */

    public readonly rateLimited:
        boolean;


    /*
    ======================================================
    Network Unavailable
    ======================================================
    */

    public readonly networkUnavailable:
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
            NetworkErrorOptions = {},
    ) {

        const severity =
            NetworkError.resolveSeverity(
                options,
            );


        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                "network",

            operation:
                options.operation ??
                options.context?.operation,

            protocol:
                options.protocol ??
                options.context?.protocol,

            host:
                options.host ??
                options.context?.host,

            port:
                options.port ??
                options.context?.port,

            requestId:
                options.requestId ??
                options.context?.requestId,

            correlationId:
                options.correlationId ??
                options.context?.correlationId,

        };


        const metadata:
            ErrorMetadata = {

            ...(options.metadata ?? {}),

            operation:
                options.operation ??
                options.metadata?.operation,

            protocol:
                options.protocol ??
                options.metadata?.protocol,

            host:
                options.host ??
                options.metadata?.host,

            port:
                options.port ??
                options.metadata?.port,

            url:
                options.url ??
                options.metadata?.url,

            method:
                options.method ??
                options.metadata?.method,

            statusCode:
                options.statusCode ??
                options.metadata?.statusCode,

            networkCode:
                options.networkCode ??
                options.metadata?.networkCode,

            timeoutMs:
                options.timeoutMs ??
                options.metadata?.timeoutMs,

            retryCount:
                options.retryCount ??
                options.metadata?.retryCount,

            maxRetries:
                options.maxRetries ??
                options.metadata?.maxRetries,

            retryAfterMs:
                options.retryAfterMs ??
                options.metadata?.retryAfterMs,

            retryable:
                options.retryable ??
                options.metadata?.retryable,

            connectionFailed:
                options.connectionFailed ??
                options.metadata?.connectionFailed,

            connectionReset:
                options.connectionReset ??
                options.metadata?.connectionReset,

            connectionRefused:
                options.connectionRefused ??
                options.metadata?.connectionRefused,

            dnsFailure:
                options.dnsFailure ??
                options.metadata?.dnsFailure,

            timeout:
                options.timeout ??
                options.metadata?.timeout,

            responseFailure:
                options.responseFailure ??
                options.metadata?.responseFailure,

            tlsFailure:
                options.tlsFailure ??
                options.metadata?.tlsFailure,

            rateLimited:
                options.rateLimited ??
                options.metadata?.rateLimited,

            networkUnavailable:
                options.networkUnavailable ??
                options.metadata?.networkUnavailable,

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
            "NetworkError";


        this.operation =
            options.operation;


        this.protocol =
            options.protocol;


        this.host =
            options.host;


        this.port =
            options.port;


        this.url =
            options.url;


        this.method =
            options.method;


        this.statusCode =
            options.statusCode;


        this.networkCode =
            options.networkCode;


        this.requestId =
            options.requestId;


        this.correlationId =
            options.correlationId;


        this.timeoutMs =
            options.timeoutMs;


        this.retryCount =
            options.retryCount;


        this.maxRetries =
            options.maxRetries;


        this.retryAfterMs =
            options.retryAfterMs;


        this.retryable =
            options.retryable ??
            NetworkError.defaultRetryable(
                options,
            );


        this.connectionFailed =
            options.connectionFailed ??
            false;


        this.connectionReset =
            options.connectionReset ??
            false;


        this.connectionRefused =
            options.connectionRefused ??
            false;


        this.dnsFailure =
            options.dnsFailure ??
            false;


        this.timeout =
            options.timeout ??
            false;


        this.responseFailure =
            options.responseFailure ??
            false;


        this.tlsFailure =
            options.tlsFailure ??
            false;


        this.rateLimited =
            options.rateLimited ??
            false;


        this.networkUnavailable =
            options.networkUnavailable ??
            false;

    }


    /*
    ======================================================
    Resolve Severity
    ======================================================
    */

    private static resolveSeverity(
        options:
            NetworkErrorOptions,
    ):
        ErrorSeverity {

        if (
            options.networkUnavailable
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.tlsFailure
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.connectionRefused
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.rateLimited
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.dnsFailure
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.timeout
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.connectionReset
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.responseFailure
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.connectionFailed
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
            NetworkErrorOptions,
    ):
        boolean {

        /*
        Rate limits should normally be retried
        after the server-provided delay.
        */

        if (
            options.rateLimited
        ) {

            return true;

        }


        /*
        Connection-level failures are generally
        transient.
        */

        if (
            options.connectionFailed ||
            options.connectionReset ||
            options.connectionRefused
        ) {

            return true;

        }


        /*
        DNS failures can be temporary.
        */

        if (
            options.dnsFailure
        ) {

            return true;

        }


        /*
        Timeouts are normally retryable.
        */

        if (
            options.timeout
        ) {

            return true;

        }


        /*
        Temporary network outages should
        trigger recovery.
        */

        if (
            options.networkUnavailable
        ) {

            return true;

        }


        /*
        TLS failures should not be blindly
        retried.
        */

        if (
            options.tlsFailure
        ) {

            return false;

        }


        /*
        HTTP response failures are dependent
        on status code.
        */

        if (
            options.responseFailure
        ) {

            if (
                options.statusCode ===
                    429
            ) {

                return true;

            }


            if (
                options.statusCode !==
                    undefined &&
                options.statusCode >= 500
            ) {

                return true;

            }


            return false;

        }


        return false;

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
    Is Connection Failed
    ======================================================
    */

    public isConnectionFailed():
        boolean {

        return this.connectionFailed;

    }


    /*
    ======================================================
    Is Connection Reset
    ======================================================
    */

    public isConnectionReset():
        boolean {

        return this.connectionReset;

    }


    /*
    ======================================================
    Is Connection Refused
    ======================================================
    */

    public isConnectionRefused():
        boolean {

        return this.connectionRefused;

    }


    /*
    ======================================================
    Is DNS Failure
    ======================================================
    */

    public isDNSFailure():
        boolean {

        return this.dnsFailure;

    }


    /*
    ======================================================
    Is Timeout
    ======================================================
    */

    public isTimeout():
        boolean {

        return this.timeout;

    }


    /*
    ======================================================
    Is ResponseFailure
    ======================================================
    */

    public isResponseFailure():
        boolean {

        return this.responseFailure;

    }


    /*
    ======================================================
    Is TLS Failure
    ======================================================
    */

    public isTLSFailure():
        boolean {

        return this.tlsFailure;

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
    Is Network Unavailable
    ======================================================
    */

    public isNetworkUnavailable():
        boolean {

        return this.networkUnavailable;

    }


    /*
    ======================================================
    Has Retries Remaining
    ======================================================
    */

    public hasRetriesRemaining():
        boolean {

        if (
            !this.retryable
        ) {

            return false;

        }


        if (
            this.retryCount ===
                undefined ||
            this.maxRetries ===
                undefined
        ) {

            return true;

        }


        return (
            this.retryCount <
            this.maxRetries
        );

    }


    /*
    ======================================================
    Retry Exhausted
    ======================================================
    */

    public isRetryExhausted():
        boolean {

        if (
            this.retryCount ===
                undefined ||
            this.maxRetries ===
                undefined
        ) {

            return false;

        }


        return (
            this.retryCount >=
            this.maxRetries
        );

    }


    /*
    ======================================================
    Get Endpoint
    ======================================================
    */

    public getEndpoint():
        string | undefined {

        if (
            this.url
        ) {

            return this.url;

        }


        if (
            !this.host
        ) {

            return undefined;

        }


        if (
            this.port ===
                undefined
        ) {

            return this.host;

        }


        return `${this.host}:${this.port}`;

    }


    /*
    ======================================================
    Get Status
    ======================================================
    */

    public getStatusCode():
        number | undefined {

        return this.statusCode;

    }


    /*
    ======================================================
    Get Network Code
    ======================================================
    */

    public getNetworkCode():
        string | undefined {

        return this.networkCode;

    }


    /*
    ======================================================
    To Network Object
    ======================================================
    */

    public toNetworkObject():
        NetworkErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            operation:
                this.operation,

            protocol:
                this.protocol,

            host:
                this.host,

            port:
                this.port,

            url:
                this.url,

            method:
                this.method,

            statusCode:
                this.statusCode,

            networkCode:
                this.networkCode,

            requestId:
                this.requestId,

            correlationId:
                this.correlationId,

            timeoutMs:
                this.timeoutMs,

            retryCount:
                this.retryCount,

            maxRetries:
                this.maxRetries,

            retryAfterMs:
                this.retryAfterMs,

            retryable:
                this.retryable,

            connectionFailed:
                this.connectionFailed,

            connectionReset:
                this.connectionReset,

            connectionRefused:
                this.connectionRefused,

            dnsFailure:
                this.dnsFailure,

            timeout:
                this.timeout,

            responseFailure:
                this.responseFailure,

            tlsFailure:
                this.tlsFailure,

            rateLimited:
                this.rateLimited,

            networkUnavailable:
                this.networkUnavailable,

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
            NetworkErrorOptions = {},
    ):
        NetworkError {

        if (
            error instanceof
            NetworkError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            const source =
                error as Error & {
                    code?:
                        string;
                };


            return new NetworkError(
                error.message,
                {

                    ...options,

                    networkCode:
                        options.networkCode ??
                        source.code,

                    cause:
                        error,

                },
            );

        }


        if (
            typeof error ===
            "string"
        ) {

            return new NetworkError(
                error,
                options,
            );

        }


        return new NetworkError(
            "Unknown network error.",
            options,
        );

    }


    /*
    ======================================================
    Connection Failed
    ======================================================
    */

    public static connectionFailed(
        message:
            string =
                "Network connection failed.",
        options:
            Omit<
                NetworkErrorOptions,
                "connectionFailed"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                connectionFailed:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Connection Reset
    ======================================================
    */

    public static connectionReset(
        message:
            string =
                "Network connection was reset.",
        options:
            Omit<
                NetworkErrorOptions,
                "connectionReset"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                connectionReset:
                    true,

                networkCode:
                    options.networkCode ??
                    "ECONNRESET",

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Connection Refused
    ======================================================
    */

    public static connectionRefused(
        message:
            string =
                "Network connection was refused.",
        options:
            Omit<
                NetworkErrorOptions,
                "connectionRefused"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                connectionRefused:
                    true,

                networkCode:
                    options.networkCode ??
                    "ECONNREFUSED",

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    DNS Failure
    ======================================================
    */

    public static dnsFailure(
        host:
            string,
        message:
            string =
                "DNS resolution failed.",
        options:
            Omit<
                NetworkErrorOptions,
                "host" |
                "dnsFailure"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                host,

                dnsFailure:
                    true,

                networkCode:
                    options.networkCode ??
                    "ENOTFOUND",

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Timeout
    ======================================================
    */

    public static timeout(
        timeoutMs:
            number,
        message:
            string =
                "Network request timed out.",
        options:
            Omit<
                NetworkErrorOptions,
                "timeout" |
                "timeoutMs"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                timeout:
                    true,

                timeoutMs,

                networkCode:
                    options.networkCode ??
                    "ETIMEDOUT",

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Response Failure
    ======================================================
    */

    public static responseFailure(
        statusCode:
            number,
        message:
            string =
                "Network request returned an unsuccessful response.",
        options:
            Omit<
                NetworkErrorOptions,
                "statusCode" |
                "responseFailure"
            > = {},
    ):
        NetworkError {

        const retryable =
            statusCode === 429 ||
            statusCode >= 500;


        return new NetworkError(
            message,
            {

                ...options,

                statusCode,

                responseFailure:
                    true,

                retryable,

            },
        );

    }


    /*
    ======================================================
    TLS Failure
    ======================================================
    */

    public static tlsFailure(
        message:
            string =
                "TLS/SSL connection failed.",
        options:
            Omit<
                NetworkErrorOptions,
                "tlsFailure"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                tlsFailure:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Rate Limited
    ======================================================
    */

    public static rateLimited(
        retryAfterMs:
            number | undefined =
                undefined,
        message:
            string =
                "Network request was rate limited.",
        options:
            Omit<
                NetworkErrorOptions,
                "rateLimited" |
                "retryAfterMs"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                rateLimited:
                    true,

                retryAfterMs,

                statusCode:
                    options.statusCode ??
                    429,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Network Unavailable
    ======================================================
    */

    public static unavailable(
        message:
            string =
                "Network is unavailable.",
        options:
            Omit<
                NetworkErrorOptions,
                "networkUnavailable"
            > = {},
    ):
        NetworkError {

        return new NetworkError(
            message,
            {

                ...options,

                networkUnavailable:
                    true,

                retryable:
                    true,

            },
        );

    }

}


/*
==========================================================
 Serialized Network Error
==========================================================
*/

export interface NetworkErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly operation?:
        string;

    readonly protocol?:
        string;

    readonly host?:
        string;

    readonly port?:
        number;

    readonly url?:
        string;

    readonly method?:
        string;

    readonly statusCode?:
        number;

    readonly networkCode?:
        string;

    readonly requestId?:
        string;

    readonly correlationId?:
        string;

    readonly timeoutMs?:
        number;

    readonly retryCount?:
        number;

    readonly maxRetries?:
        number;

    readonly retryAfterMs?:
        number;

    readonly retryable:
        boolean;

    readonly connectionFailed:
        boolean;

    readonly connectionReset:
        boolean;

    readonly connectionRefused:
        boolean;

    readonly dnsFailure:
        boolean;

    readonly timeout:
        boolean;

    readonly responseFailure:
        boolean;

    readonly tlsFailure:
        boolean;

    readonly rateLimited:
        boolean;

    readonly networkUnavailable:
        boolean;

}


/*
==========================================================
 Factory
==========================================================
*/

export function createNetworkError(
    message:
        string,
    options:
        NetworkErrorOptions = {},
):
    NetworkError {

    return new NetworkError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize
==========================================================
*/

export function normalizeNetworkError(
    error:
        unknown,
    options:
        NetworkErrorOptions = {},
):
    NetworkError {

    return NetworkError.from(
        error,
        options,
    );

}


/*
==========================================================
 Connection Factory
==========================================================
*/

export function createConnectionFailedError(
    options:
        Omit<
            NetworkErrorOptions,
            "connectionFailed"
        > = {},
):
    NetworkError {

    return NetworkError.connectionFailed(
        "Network connection failed.",
        options,
    );

}


/*
==========================================================
 Reset Factory
==========================================================
*/

export function createConnectionResetError(
    options:
        Omit<
            NetworkErrorOptions,
            "connectionReset"
        > = {},
):
    NetworkError {

    return NetworkError.connectionReset(
        "Network connection was reset.",
        options,
    );

}


/*
==========================================================
 Refused Factory
==========================================================
*/

export function createConnectionRefusedError(
    options:
        Omit<
            NetworkErrorOptions,
            "connectionRefused"
        > = {},
):
    NetworkError {

    return NetworkError.connectionRefused(
        "Network connection was refused.",
        options,
    );

}


/*
==========================================================
 DNS Factory
==========================================================
*/

export function createDNSFailureError(
    host:
        string,
    options:
        Omit<
            NetworkErrorOptions,
            "host" |
            "dnsFailure"
        > = {},
):
    NetworkError {

    return NetworkError.dnsFailure(
        host,
        "DNS resolution failed.",
        options,
    );

}


/*
==========================================================
 Timeout Factory
==========================================================
*/

export function createNetworkTimeoutError(
    timeoutMs:
        number,
    options:
        Omit<
            NetworkErrorOptions,
            "timeout" |
            "timeoutMs"
        > = {},
):
    NetworkError {

    return NetworkError.timeout(
        timeoutMs,
        "Network request timed out.",
        options,
    );

}


/*
==========================================================
 Response Factory
==========================================================
*/

export function createNetworkResponseError(
    statusCode:
        number,
    options:
        Omit<
            NetworkErrorOptions,
            "statusCode" |
            "responseFailure"
        > = {},
):
    NetworkError {

    return NetworkError.responseFailure(
        statusCode,
        "Network request returned an unsuccessful response.",
        options,
    );

}


/*
==========================================================
 TLS Factory
==========================================================
*/

export function createNetworkTLSFailureError(
    options:
        Omit<
            NetworkErrorOptions,
            "tlsFailure"
        > = {},
):
    NetworkError {

    return NetworkError.tlsFailure(
        "TLS/SSL connection failed.",
        options,
    );

}


/*
==========================================================
 Rate Limit Factory
==========================================================
*/

export function createNetworkRateLimitError(
    retryAfterMs:
        number | undefined =
            undefined,
    options:
        Omit<
            NetworkErrorOptions,
            "rateLimited" |
            "retryAfterMs"
        > = {},
):
    NetworkError {

    return NetworkError.rateLimited(
        retryAfterMs,
        "Network request was rate limited.",
        options,
    );

}


/*
==========================================================
 Unavailable Factory
==========================================================
*/

export function createNetworkUnavailableError(
    options:
        Omit<
            NetworkErrorOptions,
            "networkUnavailable"
        > = {},
):
    NetworkError {

    return NetworkError.unavailable(
        "Network is unavailable.",
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isNetworkError(
    error:
        unknown,
):
    error is NetworkError {

    return (
        error instanceof
        NetworkError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default NetworkError;
