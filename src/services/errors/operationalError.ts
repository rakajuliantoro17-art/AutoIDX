/**
==========================================================
AURA Trade OS
Operational Error
Version : 0.0.7 Alpha
==========================================================
Operational-specific Error Model
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
 Operational Error Options
==========================================================
*/

export interface OperationalErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Operational service name.
     */
    readonly service?:
        string;

    /**
     * Service version.
     */
    readonly serviceVersion?:
        string;

    /**
     * Operational component.
     */
    readonly component?:
        string;

    /**
     * Operational operation.
     */
    readonly operation?:
        string;

    /**
     * Dependency name.
     */
    readonly dependency?:
        string;

    /**
     * Dependency type.
     *
     * Example:
     * database
     * exchange
     * network
     * filesystem
     */
    readonly dependencyType?:
        string;

    /**
     * Host.
     */
    readonly host?:
        string;

    /**
     * Port.
     */
    readonly port?:
        number;

    /**
     * HTTP/status-like code.
     */
    readonly statusCode?:
        number;

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
     * Maximum retries.
     */
    readonly maxRetries?:
        number;

    /**
     * Retryable operation.
     */
    readonly retryable?:
        boolean;

    /**
     * Suggested retry delay.
     */
    readonly retryAfterMs?:
        number;

    /**
     * Service unavailable.
     */
    readonly serviceUnavailable?:
        boolean;

    /**
     * Dependency unavailable.
     */
    readonly dependencyUnavailable?:
        boolean;

    /**
     * Timeout occurred.
     */
    readonly timeout?:
        boolean;

    /**
     * Resource exhausted.
     */
    readonly resourceExhausted?:
        boolean;

    /**
     * Maintenance mode.
     */
    readonly maintenance?:
        boolean;

    /**
     * Operational degradation.
     */
    readonly degraded?:
        boolean;

    /**
     * Capacity issue.
     */
    readonly capacityExceeded?:
        boolean;

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
 Operational Error
==========================================================
*/

export class OperationalError
    extends AURAError {

    /*
    ======================================================
    Service
    ======================================================
    */

    public readonly service:
        string | undefined;


    /*
    ======================================================
    Service Version
    ======================================================
    */

    public readonly serviceVersion:
        string | undefined;


    /*
    ======================================================
    Component
    ======================================================
    */

    public readonly component:
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
    Dependency
    ======================================================
    */

    public readonly dependency:
        string | undefined;


    /*
    ======================================================
    Dependency Type
    ======================================================
    */

    public readonly dependencyType:
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
    Status Code
    ======================================================
    */

    public readonly statusCode:
        number | undefined;


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
    Service Unavailable
    ======================================================
    */

    public readonly serviceUnavailable:
        boolean;


    /*
    ======================================================
    Dependency Unavailable
    ======================================================
    */

    public readonly dependencyUnavailable:
        boolean;


    /*
    ======================================================
    Timeout Occurred
    ======================================================
    */

    public readonly timeout:
        boolean;


    /*
    ======================================================
    Resource Exhausted
    ======================================================
    */

    public readonly resourceExhausted:
        boolean;


    /*
    ======================================================
    Maintenance
    ======================================================
    */

    public readonly maintenance:
        boolean;


    /*
    ======================================================
    Degraded
    ======================================================
    */

    public readonly degraded:
        boolean;


    /*
    ======================================================
    Capacity Exceeded
    ======================================================
    */

    public readonly capacityExceeded:
        boolean;


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
    Constructor
    ======================================================
    */

    public constructor(
        message:
            string,
        options:
            OperationalErrorOptions = {},
    ) {

        const severity =
            OperationalError.resolveSeverity(
                options,
            );


        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                "operational",

            service:
                options.service ??
                options.context?.service ??
                "operational-service",

            component:
                options.component ??
                options.context?.component,

            operation:
                options.operation ??
                options.context?.operation,

            dependency:
                options.dependency ??
                options.context?.dependency,

            dependencyType:
                options.dependencyType ??
                options.context?.dependencyType,

            host:
                options.host ??
                options.context?.host,

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

            service:
                options.service ??
                options.metadata?.service,

            serviceVersion:
                options.serviceVersion ??
                options.metadata?.serviceVersion,

            component:
                options.component ??
                options.metadata?.component,

            operation:
                options.operation ??
                options.metadata?.operation,

            dependency:
                options.dependency ??
                options.metadata?.dependency,

            dependencyType:
                options.dependencyType ??
                options.metadata?.dependencyType,

            host:
                options.host ??
                options.metadata?.host,

            port:
                options.port ??
                options.metadata?.port,

            statusCode:
                options.statusCode ??
                options.metadata?.statusCode,

            timeoutMs:
                options.timeoutMs ??
                options.metadata?.timeoutMs,

            retryCount:
                options.retryCount ??
                options.metadata?.retryCount,

            maxRetries:
                options.maxRetries ??
                options.metadata?.maxRetries,

            retryable:
                options.retryable ??
                options.metadata?.retryable,

            retryAfterMs:
                options.retryAfterMs ??
                options.metadata?.retryAfterMs,

            serviceUnavailable:
                options.serviceUnavailable ??
                options.metadata?.serviceUnavailable,

            dependencyUnavailable:
                options.dependencyUnavailable ??
                options.metadata?.dependencyUnavailable,

            timeout:
                options.timeout ??
                options.metadata?.timeout,

            resourceExhausted:
                options.resourceExhausted ??
                options.metadata?.resourceExhausted,

            maintenance:
                options.maintenance ??
                options.metadata?.maintenance,

            degraded:
                options.degraded ??
                options.metadata?.degraded,

            capacityExceeded:
                options.capacityExceeded ??
                options.metadata?.capacityExceeded,

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
            "OperationalError";


        this.service =
            options.service;


        this.serviceVersion =
            options.serviceVersion;


        this.component =
            options.component;


        this.operation =
            options.operation;


        this.dependency =
            options.dependency;


        this.dependencyType =
            options.dependencyType;


        this.host =
            options.host;


        this.port =
            options.port;


        this.statusCode =
            options.statusCode;


        this.timeoutMs =
            options.timeoutMs;


        this.retryCount =
            options.retryCount;


        this.maxRetries =
            options.maxRetries;


        this.retryable =
            options.retryable ??
            OperationalError.defaultRetryable(
                options,
            );


        this.retryAfterMs =
            options.retryAfterMs;


        this.serviceUnavailable =
            options.serviceUnavailable ??
            false;


        this.dependencyUnavailable =
            options.dependencyUnavailable ??
            false;


        this.timeout =
            options.timeout ??
            false;


        this.resourceExhausted =
            options.resourceExhausted ??
            false;


        this.maintenance =
            options.maintenance ??
            false;


        this.degraded =
            options.degraded ??
            false;


        this.capacityExceeded =
            options.capacityExceeded ??
            false;


        this.requestId =
            options.requestId;


        this.correlationId =
            options.correlationId;

    }


    /*
    ======================================================
    Resolve Severity
    ======================================================
    */

    private static resolveSeverity(
        options:
            OperationalErrorOptions,
    ):
        ErrorSeverity {

        if (
            options.resourceExhausted
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.capacityExceeded
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.serviceUnavailable
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.dependencyUnavailable
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.maintenance
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.degraded
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.timeout
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
            OperationalErrorOptions,
    ):
        boolean {

        if (
            options.maintenance
        ) {

            return false;

        }


        if (
            options.resourceExhausted
        ) {

            return true;

        }


        if (
            options.capacityExceeded
        ) {

            return true;

        }


        if (
            options.serviceUnavailable
        ) {

            return true;

        }


        if (
            options.dependencyUnavailable
        ) {

            return true;

        }


        if (
            options.timeout
        ) {

            return true;

        }


        if (
            options.degraded
        ) {

            return true;

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
    Is Service Unavailable
    ======================================================
    */

    public isServiceUnavailable():
        boolean {

        return this.serviceUnavailable;

    }


    /*
    ======================================================
    Is Dependency Unavailable
    ======================================================
    */

    public isDependencyUnavailable():
        boolean {

        return this.dependencyUnavailable;

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
    Is Resource Exhausted
    ======================================================
    */

    public isResourceExhausted():
        boolean {

        return this.resourceExhausted;

    }


    /*
    ======================================================
    Is Maintenance
    ======================================================
    */

    public isMaintenance():
        boolean {

        return this.maintenance;

    }


    /*
    ======================================================
    Is Degraded
    ======================================================
    */

    public isDegraded():
        boolean {

        return this.degraded;

    }


    /*
    ======================================================
    Is Capacity Exceeded
    ======================================================
    */

    public isCapacityExceeded():
        boolean {

        return this.capacityExceeded;

    }


    /*
    ======================================================
    Get Service
    ======================================================
    */

    public getService():
        string | undefined {

        return this.service;

    }


    /*
    ======================================================
    Get Component
    ======================================================
    */

    public getComponent():
        string | undefined {

        return this.component;

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
    Get Dependency
    ======================================================
    */

    public getDependency():
        string | undefined {

        return this.dependency;

    }


    /*
    ======================================================
    Get Dependency Type
    ======================================================
    */

    public getDependencyType():
        string | undefined {

        return this.dependencyType;

    }


    /*
    ======================================================
    Get Timeout
    ======================================================
    */

    public getTimeout():
        number | undefined {

        return this.timeoutMs;

    }


    /*
    ======================================================
    Get Retry Count
    ======================================================
    */

    public getRetryCount():
        number | undefined {

        return this.retryCount;

    }


    /*
    ======================================================
    Has Retry Attempts Remaining
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
            this.maxRetries ===
                undefined ||
            this.retryCount ===
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
            this.maxRetries ===
                undefined ||
            this.retryCount ===
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
    To Operational Object
    ======================================================
    */

    public toOperationalObject():
        OperationalErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            service:
                this.service,

            serviceVersion:
                this.serviceVersion,

            component:
                this.component,

            operation:
                this.operation,

            dependency:
                this.dependency,

            dependencyType:
                this.dependencyType,

            host:
                this.host,

            port:
                this.port,

            statusCode:
                this.statusCode,

            timeoutMs:
                this.timeoutMs,

            retryCount:
                this.retryCount,

            maxRetries:
                this.maxRetries,

            retryable:
                this.retryable,

            retryAfterMs:
                this.retryAfterMs,

            serviceUnavailable:
                this.serviceUnavailable,

            dependencyUnavailable:
                this.dependencyUnavailable,

            timeout:
                this.timeout,

            resourceExhausted:
                this.resourceExhausted,

            maintenance:
                this.maintenance,

            degraded:
                this.degraded,

            capacityExceeded:
                this.capacityExceeded,

            requestId:
                this.requestId,

            correlationId:
                this.correlationId,

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
            OperationalErrorOptions = {},
    ):
        OperationalError {

        if (
            error instanceof
            OperationalError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            return new OperationalError(
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

            return new OperationalError(
                error,
                options,
            );

        }


        return new OperationalError(
            "Unknown operational error.",
            options,
        );

    }


    /*
    ======================================================
    Service Unavailable
    ======================================================
    */

    public static serviceUnavailable(
        service:
            string,
        message:
            string =
                "Operational service is unavailable.",
        options:
            Omit<
                OperationalErrorOptions,
                "service" |
                "serviceUnavailable"
            > = {},
    ):
        OperationalError {

        return new OperationalError(
            message,
            {

                ...options,

                service,

                serviceUnavailable:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Dependency Unavailable
    ======================================================
    */

    public static dependencyUnavailable(
        dependency:
            string,
        message:
            string =
                "Required dependency is unavailable.",
        options:
            Omit<
                OperationalErrorOptions,
                "dependency" |
                "dependencyUnavailable"
            > = {},
    ):
        OperationalError {

        return new OperationalError(
            message,
            {

                ...options,

                dependency,

                dependencyUnavailable:
                    true,

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
                "Operational operation timed out.",
        options:
            Omit<
                OperationalErrorOptions,
                "timeout" |
                "timeoutMs"
            > = {},
    ):
        OperationalError {

        return new OperationalError(
            message,
            {

                ...options,

                timeout:
                    true,

                timeoutMs,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Resource Exhausted
    ======================================================
    */

    public static resourceExhausted(
        message:
            string =
                "Operational resource exhausted.",
        options:
            Omit<
                OperationalErrorOptions,
                "resourceExhausted"
            > = {},
    ):
        OperationalError {

        return new OperationalError(
            message,
            {

                ...options,

                resourceExhausted:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Capacity Exceeded
    ======================================================
    */

    public static capacityExceeded(
        message:
            string =
                "Operational capacity exceeded.",
        options:
            Omit<
                OperationalErrorOptions,
                "capacityExceeded"
            > = {},
    ):
        OperationalError {

        return new OperationalError(
            message,
            {

                ...options,

                capacityExceeded:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Maintenance
    ======================================================
    */

    public static maintenance(
        message:
            string =
                "Service is temporarily unavailable due to maintenance.",
        options:
            Omit<
                OperationalErrorOptions,
                "maintenance"
            > = {},
    ):
        OperationalError {

        return new OperationalError(
            message,
            {

                ...options,

                maintenance:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Degraded
    ======================================================
    */

    public static degraded(
        message:
            string =
                "Operational service is running in degraded mode.",
        options:
            Omit<
                OperationalErrorOptions,
                "degraded"
            > = {},
    ):
        OperationalError {

        return new OperationalError(
            message,
            {

                ...options,

                degraded:
                    true,

                retryable:
                    true,

            },
        );

    }

}


/*
==========================================================
 Serialized Operational Error
==========================================================
*/

export interface OperationalErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly service?:
        string;

    readonly serviceVersion?:
        string;

    readonly component?:
        string;

    readonly operation?:
        string;

    readonly dependency?:
        string;

    readonly dependencyType?:
        string;

    readonly host?:
        string;

    readonly port?:
        number;

    readonly statusCode?:
        number;

    readonly timeoutMs?:
        number;

    readonly retryCount?:
        number;

    readonly maxRetries?:
        number;

    readonly retryable:
        boolean;

    readonly retryAfterMs?:
        number;

    readonly serviceUnavailable:
        boolean;

    readonly dependencyUnavailable:
        boolean;

    readonly timeout:
        boolean;

    readonly resourceExhausted:
        boolean;

    readonly maintenance:
        boolean;

    readonly degraded:
        boolean;

    readonly capacityExceeded:
        boolean;

    readonly requestId?:
        string;

    readonly correlationId?:
        string;

}


/*
==========================================================
 Factory
==========================================================
*/

export function createOperationalError(
    message:
        string,
    options:
        OperationalErrorOptions = {},
):
    OperationalError {

    return new OperationalError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize
==========================================================
*/

export function normalizeOperationalError(
    error:
        unknown,
    options:
        OperationalErrorOptions = {},
):
    OperationalError {

    return OperationalError.from(
        error,
        options,
    );

}


/*
==========================================================
 Service Factory
==========================================================
*/

export function createServiceUnavailableError(
    service:
        string,
    options:
        Omit<
            OperationalErrorOptions,
            "service" |
            "serviceUnavailable"
        > = {},
):
    OperationalError {

    return OperationalError.serviceUnavailable(
        service,
        "Operational service is unavailable.",
        options,
    );

}


/*
==========================================================
 Dependency Factory
==========================================================
*/

export function createDependencyUnavailableError(
    dependency:
        string,
    options:
        Omit<
            OperationalErrorOptions,
            "dependency" |
            "dependencyUnavailable"
        > = {},
):
    OperationalError {

    return OperationalError.dependencyUnavailable(
        dependency,
        "Required dependency is unavailable.",
        options,
    );

}


/*
==========================================================
 Timeout Factory
==========================================================
*/

export function createOperationalTimeoutError(
    timeoutMs:
        number,
    options:
        Omit<
            OperationalErrorOptions,
            "timeout" |
            "timeoutMs"
        > = {},
):
    OperationalError {

    return OperationalError.timeout(
        timeoutMs,
        "Operational operation timed out.",
        options,
    );

}


/*
==========================================================
 Resource Factory
==========================================================
*/

export function createResourceExhaustedError(
    options:
        Omit<
            OperationalErrorOptions,
            "resourceExhausted"
        > = {},
):
    OperationalError {

    return OperationalError.resourceExhausted(
        "Operational resource exhausted.",
        options,
    );

}


/*
==========================================================
 Capacity Factory
==========================================================
*/

export function createCapacityExceededError(
    options:
        Omit<
            OperationalErrorOptions,
            "capacityExceeded"
        > = {},
):
    OperationalError {

    return OperationalError.capacityExceeded(
        "Operational capacity exceeded.",
        options,
    );

}


/*
==========================================================
 Maintenance Factory
==========================================================
*/

export function createMaintenanceError(
    options:
        Omit<
            OperationalErrorOptions,
            "maintenance"
        > = {},
):
    OperationalError {

    return OperationalError.maintenance(
        "Service is temporarily unavailable due to maintenance.",
        options,
    );

}


/*
==========================================================
 Degraded Factory
==========================================================
*/

export function createOperationalDegradedError(
    options:
        Omit<
            OperationalErrorOptions,
            "degraded"
        > = {},
):
    OperationalError {

    return OperationalError.degraded(
        "Operational service is running in degraded mode.",
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isOperationalError(
    error:
        unknown,
):
    error is OperationalError {

    return (
        error instanceof
        OperationalError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default OperationalError;
