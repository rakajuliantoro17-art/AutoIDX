/**
==========================================================
AURA Trade OS
Runtime Error
Version : 0.0.7 Alpha
==========================================================
Runtime-specific Error Model
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
 Runtime Error Options
==========================================================
*/

export interface RuntimeErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Runtime identifier.
     */
    readonly runtime?:
        string;

    /**
     * Runtime version.
     */
    readonly runtimeVersion?:
        string;

    /**
     * Environment name.
     *
     * Example:
     * development
     * staging
     * production
     */
    readonly environment?:
        string;

    /**
     * Runtime component.
     *
     * Example:
     * scheduler
     * exchange
     * strategy
     * telemetry
     */
    readonly component?:
        string;

    /**
     * Runtime operation.
     */
    readonly operation?:
        string;

    /**
     * Process ID.
     */
    readonly processId?:
        number;

    /**
     * Worker ID.
     */
    readonly workerId?:
        string;

    /**
     * Hostname.
     */
    readonly hostname?:
        string;

    /**
     * Runtime state.
     */
    readonly runtimeState?:
        string;

    /**
     * Expected runtime state.
     */
    readonly expectedState?:
        string;

    /**
     * Actual runtime state.
     */
    readonly actualState?:
        string;

    /**
     * Whether the runtime is shutting down.
     */
    readonly shuttingDown?:
        boolean;

    /**
     * Whether the runtime is starting.
     */
    readonly starting?:
        boolean;

    /**
     * Whether the runtime has crashed.
     */
    readonly crashed?:
        boolean;

    /**
     * Whether the runtime is degraded.
     */
    readonly degraded?:
        boolean;

    /**
     * Whether the error can be retried.
     */
    readonly retryable?:
        boolean;

    /**
     * Suggested retry delay.
     */
    readonly retryAfterMs?:
        number;

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
 Runtime Error
==========================================================
*/

export class RuntimeError
    extends AURAError {

    /*
    ======================================================
    Runtime
    ======================================================
    */

    public readonly runtime:
        string | undefined;


    /*
    ======================================================
    Runtime Version
    ======================================================
    */

    public readonly runtimeVersion:
        string | undefined;


    /*
    ======================================================
    Environment
    ======================================================
    */

    public readonly environment:
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
    Process ID
    ======================================================
    */

    public readonly processId:
        number | undefined;


    /*
    ======================================================
    Worker ID
    ======================================================
    */

    public readonly workerId:
        string | undefined;


    /*
    ======================================================
    Hostname
    ======================================================
    */

    public readonly hostname:
        string | undefined;


    /*
    ======================================================
    Runtime State
    ======================================================
    */

    public readonly runtimeState:
        string | undefined;


    /*
    ======================================================
    Expected State
    ======================================================
    */

    public readonly expectedState:
        string | undefined;


    /*
    ======================================================
    Actual State
    ======================================================
    */

    public readonly actualState:
        string | undefined;


    /*
    ======================================================
    Shutting Down
    ======================================================
    */

    public readonly shuttingDown:
        boolean;


    /*
    ======================================================
    Starting
    ======================================================
    */

    public readonly starting:
        boolean;


    /*
    ======================================================
    Crashed
    ======================================================
    */

    public readonly crashed:
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
            RuntimeErrorOptions = {},
    ) {

        const severity =
            RuntimeError.resolveSeverity(
                options,
            );


        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                "runtime",

            service:
                options.context?.service ??
                "runtime-service",

            runtime:
                options.runtime ??
                options.context?.runtime,

            environment:
                options.environment ??
                options.context?.environment,

            component:
                options.component ??
                options.context?.component,

            operation:
                options.operation ??
                options.context?.operation,

            processId:
                options.processId ??
                options.context?.processId,

            workerId:
                options.workerId ??
                options.context?.workerId,

            hostname:
                options.hostname ??
                options.context?.hostname,

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

            runtime:
                options.runtime ??
                options.metadata?.runtime,

            runtimeVersion:
                options.runtimeVersion ??
                options.metadata?.runtimeVersion,

            environment:
                options.environment ??
                options.metadata?.environment,

            component:
                options.component ??
                options.metadata?.component,

            operation:
                options.operation ??
                options.metadata?.operation,

            processId:
                options.processId ??
                options.metadata?.processId,

            workerId:
                options.workerId ??
                options.metadata?.workerId,

            hostname:
                options.hostname ??
                options.metadata?.hostname,

            runtimeState:
                options.runtimeState ??
                options.metadata?.runtimeState,

            expectedState:
                options.expectedState ??
                options.metadata?.expectedState,

            actualState:
                options.actualState ??
                options.metadata?.actualState,

            retryable:
                options.retryable ??
                options.metadata?.retryable,

            retryAfterMs:
                options.retryAfterMs ??
                options.metadata?.retryAfterMs,

            shuttingDown:
                options.shuttingDown ??
                options.metadata?.shuttingDown,

            starting:
                options.starting ??
                options.metadata?.starting,

            crashed:
                options.crashed ??
                options.metadata?.crashed,

            degraded:
                options.degraded ??
                options.metadata?.degraded,

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
            "RuntimeError";


        this.runtime =
            options.runtime;


        this.runtimeVersion =
            options.runtimeVersion;


        this.environment =
            options.environment;


        this.component =
            options.component;


        this.operation =
            options.operation;


        this.processId =
            options.processId;


        this.workerId =
            options.workerId;


        this.hostname =
            options.hostname;


        this.runtimeState =
            options.runtimeState;


        this.expectedState =
            options.expectedState;


        this.actualState =
            options.actualState;


        this.shuttingDown =
            options.shuttingDown ??
            false;


        this.starting =
            options.starting ??
            false;


        this.crashed =
            options.crashed ??
            false;


        this.degraded =
            options.degraded ??
            false;


        this.retryable =
            options.retryable ??
            RuntimeError.defaultRetryable(
                options,
            );


        this.retryAfterMs =
            options.retryAfterMs;


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
            RuntimeErrorOptions,
    ):
        ErrorSeverity {

        if (
            options.crashed
        ) {

            return ErrorSeverity.FATAL;

        }


        if (
            options.shuttingDown
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.degraded
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.starting
        ) {

            return ErrorSeverity.WARNING;

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
            RuntimeErrorOptions,
    ):
        boolean {

        if (
            options.crashed
        ) {

            return false;

        }


        if (
            options.shuttingDown
        ) {

            return false;

        }


        if (
            options.degraded
        ) {

            return true;

        }


        if (
            options.starting
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
    Is Runtime Crashed
    ======================================================
    */

    public isCrashed():
        boolean {

        return this.crashed;

    }


    /*
    ======================================================
    Is Runtime Degraded
    ======================================================
    */

    public isDegraded():
        boolean {

        return this.degraded;

    }


    /*
    ======================================================
    Is Starting
    ======================================================
    */

    public isStarting():
        boolean {

        return this.starting;

    }


    /*
    ======================================================
    Is Shutting Down
    ======================================================
    */

    public isShuttingDown():
        boolean {

        return this.shuttingDown;

    }


    /*
    ======================================================
    Get Runtime
    ======================================================
    */

    public getRuntime():
        string | undefined {

        return this.runtime;

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
    Get Runtime State
    ======================================================
    */

    public getRuntimeState():
        string | undefined {

        return this.runtimeState;

    }


    /*
    ======================================================
    Get Expected State
    ======================================================
    */

    public getExpectedState():
        string | undefined {

        return this.expectedState;

    }


    /*
    ======================================================
    Get Actual State
    ======================================================
    */

    public getActualState():
        string | undefined {

        return this.actualState;

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
    Is State Mismatch
    ======================================================
    */

    public isStateMismatch():
        boolean {

        if (
            this.expectedState ===
                undefined ||
            this.actualState ===
                undefined
        ) {

            return false;

        }


        return (
            this.expectedState !==
            this.actualState
        );

    }


    /*
    ======================================================
    To Runtime Object
    ======================================================
    */

    public toRuntimeObject():
        RuntimeErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            runtime:
                this.runtime,

            runtimeVersion:
                this.runtimeVersion,

            environment:
                this.environment,

            component:
                this.component,

            operation:
                this.operation,

            processId:
                this.processId,

            workerId:
                this.workerId,

            hostname:
                this.hostname,

            runtimeState:
                this.runtimeState,

            expectedState:
                this.expectedState,

            actualState:
                this.actualState,

            shuttingDown:
                this.shuttingDown,

            starting:
                this.starting,

            crashed:
                this.crashed,

            degraded:
                this.degraded,

            retryable:
                this.retryable,

            retryAfterMs:
                this.retryAfterMs,

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
            RuntimeErrorOptions = {},
    ):
        RuntimeError {

        if (
            error instanceof
            RuntimeError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            return new RuntimeError(
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

            return new RuntimeError(
                error,
                options,
            );

        }


        return new RuntimeError(
            "Unknown runtime error.",
            options,
        );

    }


    /*
    ======================================================
    Runtime Crash
    ======================================================
    */

    public static crash(
        message:
            string =
                "Runtime crashed.",
        options:
            Omit<
                RuntimeErrorOptions,
                "crashed"
            > = {},
    ):
        RuntimeError {

        return new RuntimeError(
            message,
            {

                ...options,

                crashed:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Runtime Degraded
    ======================================================
    */

    public static degraded(
        message:
            string =
                "Runtime is operating in degraded mode.",
        options:
            Omit<
                RuntimeErrorOptions,
                "degraded"
            > = {},
    ):
        RuntimeError {

        return new RuntimeError(
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


    /*
    ======================================================
    Runtime Starting
    ======================================================
    */

    public static starting(
        message:
            string =
                "Runtime is still starting.",
        options:
            Omit<
                RuntimeErrorOptions,
                "starting"
            > = {},
    ):
        RuntimeError {

        return new RuntimeError(
            message,
            {

                ...options,

                starting:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Runtime Shutdown
    ======================================================
    */

    public static shutdown(
        message:
            string =
                "Runtime is shutting down.",
        options:
            Omit<
                RuntimeErrorOptions,
                "shuttingDown"
            > = {},
    ):
        RuntimeError {

        return new RuntimeError(
            message,
            {

                ...options,

                shuttingDown:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Runtime State Mismatch
    ======================================================
    */

    public static stateMismatch(
        expectedState:
            string,
        actualState:
            string,
        options:
            Omit<
                RuntimeErrorOptions,
                "expectedState" |
                "actualState"
            > = {},
    ):
        RuntimeError {

        return new RuntimeError(
            `Runtime state mismatch: expected "${expectedState}", received "${actualState}".`,
            {

                ...options,

                expectedState,

                actualState,

            },
        );

    }

}


/*
==========================================================
 Serialized Runtime Error
==========================================================
*/

export interface RuntimeErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly runtime?:
        string;

    readonly runtimeVersion?:
        string;

    readonly environment?:
        string;

    readonly component?:
        string;

    readonly operation?:
        string;

    readonly processId?:
        number;

    readonly workerId?:
        string;

    readonly hostname?:
        string;

    readonly runtimeState?:
        string;

    readonly expectedState?:
        string;

    readonly actualState?:
        string;

    readonly shuttingDown:
        boolean;

    readonly starting:
        boolean;

    readonly crashed:
        boolean;

    readonly degraded:
        boolean;

    readonly retryable:
        boolean;

    readonly retryAfterMs?:
        number;

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

export function createRuntimeError(
    message:
        string,
    options:
        RuntimeErrorOptions = {},
):
    RuntimeError {

    return new RuntimeError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize
==========================================================
*/

export function normalizeRuntimeError(
    error:
        unknown,
    options:
        RuntimeErrorOptions = {},
):
    RuntimeError {

    return RuntimeError.from(
        error,
        options,
    );

}


/*
==========================================================
 Crash Factory
==========================================================
*/

export function createRuntimeCrashError(
    options:
        Omit<
            RuntimeErrorOptions,
            "crashed"
        > = {},
):
    RuntimeError {

    return RuntimeError.crash(
        "Runtime crashed.",
        options,
    );

}


/*
==========================================================
 Degraded Factory
==========================================================
*/

export function createRuntimeDegradedError(
    options:
        Omit<
            RuntimeErrorOptions,
            "degraded"
        > = {},
):
    RuntimeError {

    return RuntimeError.degraded(
        "Runtime is operating in degraded mode.",
        options,
    );

}


/*
==========================================================
 Starting Factory
==========================================================
*/

export function createRuntimeStartingError(
    options:
        Omit<
            RuntimeErrorOptions,
            "starting"
        > = {},
):
    RuntimeError {

    return RuntimeError.starting(
        "Runtime is still starting.",
        options,
    );

}


/*
==========================================================
 Shutdown Factory
==========================================================
*/

export function createRuntimeShutdownError(
    options:
        Omit<
            RuntimeErrorOptions,
            "shuttingDown"
        > = {},
):
    RuntimeError {

    return RuntimeError.shutdown(
        "Runtime is shutting down.",
        options,
    );

}


/*
==========================================================
 State Mismatch Factory
==========================================================
*/

export function createRuntimeStateMismatchError(
    expectedState:
        string,
    actualState:
        string,
    options:
        Omit<
            RuntimeErrorOptions,
            "expectedState" |
            "actualState"
        > = {},
):
    RuntimeError {

    return RuntimeError.stateMismatch(
        expectedState,
        actualState,
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isRuntimeError(
    error:
        unknown,
):
    error is RuntimeError {

    return (
        error instanceof
        RuntimeError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default RuntimeError;
