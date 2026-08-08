/**
==========================================================
AURA Trade OS
Base Error
Version : 0.0.7 Alpha
==========================================================
Core Application Error
==========================================================
*/

import type {
    ErrorCode,
} from "./errorCode";

import type {
    ErrorContext,
} from "./errorContext";

import type {
    ErrorMetadata,
} from "./errorMetadata";

import type {
    ErrorSeverity,
} from "./errorSeverity";


/*
==========================================================
Error Options
==========================================================
*/

export interface AURAErrorOptions {

    /**
     * Stable machine-readable error code.
     */
    readonly code?: ErrorCode;

    /**
     * Error severity.
     */
    readonly severity?: ErrorSeverity;

    /**
     * Operational context.
     */
    readonly context?: ErrorContext;

    /**
     * Additional metadata.
     */
    readonly metadata?: ErrorMetadata;

    /**
     * Original underlying error.
     */
    readonly cause?: unknown;

}


/*
==========================================================
Serialized Error
==========================================================
*/

export interface SerializedAURAError {

    readonly name: string;

    readonly message: string;

    readonly code?: ErrorCode;

    readonly severity?: ErrorSeverity;

    readonly context?: ErrorContext;

    readonly metadata?: ErrorMetadata;

    readonly stack?: string;

    readonly cause?: unknown;

}


/*
==========================================================
 AURA Base Error
==========================================================
*/

export class AURAError
    extends Error {

    /*
    ======================================================
    Public Properties
    ======================================================
    */

    /**
     * Stable machine-readable error code.
     */
    public readonly code?: ErrorCode;


    /**
     * Error severity.
     */
    public readonly severity?: ErrorSeverity;


    /**
     * Operational context.
     */
    public readonly context?: ErrorContext;


    /**
     * Additional metadata.
     */
    public readonly metadata?: ErrorMetadata;


    /**
     * Original underlying error.
     */
    public readonly cause?: unknown;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        message: string,
        options: AURAErrorOptions = {},
    ) {

        super(message);


        /*
        ==================================================
        Error Name
        ==================================================
        */

        this.name =
            new.target.name;


        /*
        ==================================================
        Properties
        ==================================================
        */

        this.code =
            options.code;


        this.severity =
            options.severity;


        this.context =
            options.context;


        this.metadata =
            options.metadata;


        this.cause =
            options.cause;


        /*
        ==================================================
        Prototype Fix
        ==================================================
        */

        Object.setPrototypeOf(
            this,
            new.target.prototype,
        );


        /*
        ==================================================
        Native Cause Support
        ==================================================
        */

        if (
            options.cause !== undefined
        ) {

            try {

                Object.defineProperty(
                    this,
                    "cause",
                    {
                        value:
                            options.cause,

                        enumerable: false,

                        configurable: true,

                        writable: false,
                    },
                );

            } catch {
                /*
                 * Some runtimes may not allow redefining
                 * Error properties. The readonly class
                 * property remains available.
                 */
            }

        }


        /*
        ==================================================
        Capture Stack
        ==================================================
        */

        if (
            Error.captureStackTrace
        ) {

            Error.captureStackTrace(
                this,
                new.target,
            );

        }

    }


    /*
    ======================================================
    Is AURA Error
    ======================================================
    */

    public static isAURAError(
        error: unknown,
    ): error is AURAError {

        return (
            error instanceof AURAError
        );

    }


    /*
    ======================================================
    Has Code
    ======================================================
    */

    public hasCode(
        code: ErrorCode,
    ): boolean {

        return this.code === code;

    }


    /*
    ======================================================
    With Metadata
    ======================================================
    */

    public withMetadata(
        metadata: ErrorMetadata,
    ): AURAError {

        const mergedMetadata = {

            ...(this.metadata ?? {}),

            ...metadata,

        } as ErrorMetadata;


        return new AURAError(
            this.message,
            {

                code:
                    this.code,

                severity:
                    this.severity,

                context:
                    this.context,

                metadata:
                    mergedMetadata,

                cause:
                    this.cause,

            },
        );

    }


    /*
    ======================================================
    Serialize
    ======================================================
    */

    public toJSON():
        SerializedAURAError {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            context:
                this.context,

            metadata:
                this.metadata,

            stack:
                this.stack,

            cause:
                AURAError.serializeCause(
                    this.cause,
                ),

        };

    }


    /*
    ======================================================
    To String
    ======================================================
    */

    public override toString(): string {

        if (
            this.code
        ) {

            return (
                `${this.name} [${this.code}]: ${this.message}`
            );

        }


        return (
            `${this.name}: ${this.message}`
        );

    }


    /*
    ======================================================
    Serialize Cause
    ======================================================
    */

    private static serializeCause(
        cause: unknown,
    ): unknown {

        if (
            cause === undefined
        ) {

            return undefined;

        }


        if (
            cause instanceof AURAError
        ) {

            return cause.toJSON();

        }


        if (
            cause instanceof Error
        ) {

            return {

                name:
                    cause.name,

                message:
                    cause.message,

                stack:
                    cause.stack,

            };

        }


        if (
            typeof cause === "object" &&
            cause !== null
        ) {

            try {

                return {
                    ...(cause as Record<
                        string,
                        unknown
                    >),
                };

            } catch {

                return String(cause);

            }

        }


        return cause;

    }

}


/*
==========================================================
 Factory
==========================================================
*/

export function createAURAError(
    message: string,
    options: AURAErrorOptions = {},
): AURAError {

    return new AURAError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize Unknown Error
==========================================================
*/

export function normalizeAURAError(
    error: unknown,
): AURAError {

    /*
    ======================================================
    Already AURA Error
    ======================================================
    */

    if (
        error instanceof AURAError
    ) {

        return error;

    }


    /*
    ======================================================
    Native Error
    ======================================================
    */

    if (
        error instanceof Error
    ) {

        return new AURAError(
            error.message,
            {

                cause:
                    error,

                metadata: {

                    originalName:
                        error.name,

                } as ErrorMetadata,

            },
        );

    }


    /*
    ======================================================
    String Error
    ======================================================
    */

    if (
        typeof error === "string"
    ) {

        return new AURAError(
            error,
        );

    }


    /*
    ======================================================
    Unknown Error
    ======================================================
    */

    let message =
        "Unknown error";


    if (
        typeof error === "object" &&
        error !== null
    ) {

        try {

            const candidate =
                error as {
                    message?: unknown;
                };


            if (
                typeof candidate.message ===
                "string"
            ) {

                message =
                    candidate.message;

            }

        } catch {
            /*
             * Ignore malformed unknown objects.
             */
        }

    }


    return new AURAError(
        message,
        {
            cause: error,
        },
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isAURAError(
    error: unknown,
): error is AURAError {

    return (
        error instanceof AURAError
    );

}


/*
==========================================================
 Error Assertion
==========================================================
*/

export function assertAURAError(
    error: unknown,
): asserts error is AURAError {

    if (
        !isAURAError(error)
    ) {

        throw new TypeError(
            "Expected an AURAError instance.",
        );

    }

}
