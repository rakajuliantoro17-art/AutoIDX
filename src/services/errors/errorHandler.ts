/**
==========================================================
AURA Trade OS
Error Handler
Version : 0.0.7 Alpha
==========================================================
Centralized Error Handling
==========================================================
*/

import {
    AURAError,
    isAURAError,
    normalizeAURAError,
} from "./error";

import {
    ErrorFactory,
} from "./errorFactory";

import type {
    ErrorContext,
} from "./errorContext";

import {
    sanitizeErrorContext,
    summarizeErrorContext,
} from "./errorContext";

import type {
    ErrorCategory,
} from "./errorCategory";

import {
    ErrorCategoryResolver,
} from "./errorCategory";

import type {
    ErrorCode,
} from "./errorCode";

import {
    getErrorCodeMetadata,
} from "./errorCode";


/*
==========================================================
 Error Handler Options
==========================================================
*/

export interface ErrorHandlerOptions {

    /**
     * Optional context added to the handled error.
     */
    readonly context?: ErrorContext;

    /**
     * Whether the error should be logged.
     *
     * Default: true
     */
    readonly log?: boolean;

    /**
     * Whether the error should be sanitized.
     *
     * Default: true
     */
    readonly sanitize?: boolean;

    /**
     * Whether the original error should be preserved.
     *
     * Default: true
     */
    readonly preserveCause?: boolean;

    /**
     * Optional error source.
     */
    readonly source?: string;

    /**
     * Optional operation name.
     */
    readonly operation?: string;

    /**
     * Optional fallback error code.
     */
    readonly code?: ErrorCode;

}


/*
==========================================================
 Handler Result
==========================================================
*/

export interface ErrorHandlerResult {

    /**
     * Normalized AURA error.
     */
    readonly error: AURAError;

    /**
     * Error code.
     */
    readonly code?: ErrorCode;

    /**
     * Error category.
     */
    readonly category: ErrorCategory;

    /**
     * Whether this error can be retried.
     */
    readonly retryable: boolean;

    /**
     * Whether the error is operational.
     */
    readonly operational: boolean;

    /**
     * Sanitized context.
     */
    readonly context: ErrorContext;

}


/*
==========================================================
 Error Handler
==========================================================
*/

export class ErrorHandler {

    /*
    ======================================================
    Handle
    ======================================================
    */

    public static handle(
        error: unknown,
        options:
            ErrorHandlerOptions = {},
    ): ErrorHandlerResult {

        const normalized =
            normalizeAURAError(
                error,
            );


        const auraError =
            this.applyContext(
                normalized,
                options,
            );


        const context =
            options.sanitize === false
                ? (
                    auraError.context ??
                    {}
                )
                : sanitizeErrorContext(
                    auraError.context ??
                    {},
                );


        const code =
            auraError.code;


        const category =
            context.category ??
            ErrorCategoryResolver.fromCode(
                code,
            );


        const metadata =
            code
                ? getErrorCodeMetadata(
                    code,
                )
                : undefined;


        const retryable =
            metadata?.retryable ??
            false;


        const operational =
            this.isOperational(
                auraError,
            );


        const result: ErrorHandlerResult = {

            error:
                auraError,

            code,

            category,

            retryable,

            operational,

            context,

        };


        if (
            options.log !== false
        ) {

            this.log(
                result,
            );

        }


        return result;

    }


    /*
    ======================================================
    Handle And Throw
    ======================================================
    */

    public static handleAndThrow(
        error: unknown,
        options:
            ErrorHandlerOptions = {},
    ): never {

        const result =
            this.handle(
                error,
                options,
            );


        throw result.error;

    }


    /*
    ======================================================
    Handle And Return
    ======================================================
    */

    public static handleAndReturn<T>(
        error: unknown,
        fallback: T,
        options:
            ErrorHandlerOptions = {},
    ): T {

        this.handle(
            error,
            options,
        );


        return fallback;

    }


    /*
    ======================================================
    Normalize
    ======================================================
    */

    public static normalize(
        error: unknown,
    ): AURAError {

        if (
            isAURAError(
                error,
            )
        ) {

            return error;

        }


        return normalizeAURAError(
            error,
        );

    }


    /*
    ======================================================
    Apply Context
    ======================================================
    */

    private static applyContext(
        error: AURAError,
        options:
            ErrorHandlerOptions,
    ): AURAError {

        const originalContext =
            error.context ??
            {};


        const additionalContext =
            options.context ??
            {};


        const mergedContext:
            ErrorContext = {

                ...originalContext,

                ...additionalContext,

                source:
                    options.source ??
                    additionalContext.source ??
                    originalContext.source,

                operation:
                    options.operation ??
                    additionalContext.operation ??
                    originalContext.operation,

            };


        if (
            !options.code &&
            !options.preserveCause
        ) {

            return error;

        }


        if (
            options.code === error.code &&
            options.preserveCause !== false
        ) {

            return new AURAError(
                error.message,
                {

                    code:
                        error.code,

                    severity:
                        error.severity,

                    context:
                        mergedContext,

                    metadata:
                        error.metadata,

                    cause:
                        error.cause,

                },
            );

        }


        return new AURAError(
            error.message,
            {

                code:
                    options.code ??
                    error.code,

                severity:
                    error.severity,

                context:
                    mergedContext,

                metadata:
                    error.metadata,

                cause:
                    options.preserveCause === false
                        ? undefined
                        : error.cause,

            },
        );

    }


    /*
    ======================================================
    Operational Check
    ======================================================
    */

    private static isOperational(
        error: AURAError,
    ): boolean {

        /*
         * An AURAError is considered operational when
         * it carries structured context or an error code.
         *
         * This allows infrastructure errors to be handled
         * consistently by telemetry and monitoring layers.
         */

        return Boolean(
            error.code ||
            error.context,
        );

    }


    /*
    ======================================================
    Logging
    ======================================================
    */

    private static log(
        result: ErrorHandlerResult,
    ): void {

        const {
            error,
            context,
            category,
            code,
            retryable,
        } = result;


        const summary =
            summarizeErrorContext(
                context,
            );


        const payload = {

            name:
                error.name,

            message:
                error.message,

            code,

            category,

            retryable,

            context:
                summary,

        };


        /*
         * Keep logging environment-agnostic.
         *
         * The telemetry layer can later replace or wrap
         * this implementation.
         */

        if (
            typeof console === "undefined"
        ) {

            return;

        }


        const severity =
            error.severity;


        if (
            severity === "critical"
        ) {

            console.error(
                "[AURA][CRITICAL]",
                payload,
            );

            return;

        }


        if (
            severity === "error"
        ) {

            console.error(
                "[AURA][ERROR]",
                payload,
            );

            return;

        }


        if (
            severity === "warning"
        ) {

            console.warn(
                "[AURA][WARNING]",
                payload,
            );

            return;

        }


        console.info(
            "[AURA][INFO]",
            payload,
        );

    }

}


/*
==========================================================
 Functional API
==========================================================
*/

/**
 * Handle an unknown error and return normalized result.
 */
export function handleError(
    error: unknown,
    options:
        ErrorHandlerOptions = {},
): ErrorHandlerResult {

    return ErrorHandler.handle(
        error,
        options,
    );

}


/*
==========================================================
 Throw API
==========================================================
*/

/**
 * Normalize and rethrow an error.
 */
export function handleAndThrow(
    error: unknown,
    options:
        ErrorHandlerOptions = {},
): never {

    return ErrorHandler.handleAndThrow(
        error,
        options,
    );

}


/*
==========================================================
 Fallback API
==========================================================
*/

/**
 * Handle an error and return a fallback value.
 */
export function handleWithFallback<T>(
    error: unknown,
    fallback: T,
    options:
        ErrorHandlerOptions = {},
): T {

    return ErrorHandler.handleAndReturn(
        error,
        fallback,
        options,
    );

}


/*
==========================================================
 Safe Execution
==========================================================
*/

export interface SafeExecutionOptions
    extends ErrorHandlerOptions {

    /**
     * Optional fallback value.
     */
    readonly fallback?: unknown;

}


/*
==========================================================
 Safe Execute
==========================================================
*/

export async function safeExecute<T>(
    operation: () => Promise<T> | T,
    options:
        SafeExecutionOptions = {},
): Promise<T | undefined> {

    try {

        return await operation();

    } catch (error) {

        ErrorHandler.handle(
            error,
            options,
        );


        return options.fallback as
            | T
            | undefined;

    }

}


/*
==========================================================
 Safe Execute With Result
==========================================================
*/

export interface SafeExecutionResult<T> {

    readonly success: boolean;

    readonly value?: T;

    readonly error?: ErrorHandlerResult;

}


/*
==========================================================
 Safe Execute Result
==========================================================
*/

export async function safeExecuteResult<T>(
    operation: () => Promise<T> | T,
    options:
        ErrorHandlerOptions = {},
): Promise<SafeExecutionResult<T>> {

    try {

        const value =
            await operation();


        return {

            success:
                true,

            value,

        };

    } catch (error) {

        const handled =
            ErrorHandler.handle(
                error,
                options,
            );


        return {

            success:
                false,

            error:
                handled,

        };

    }

}


/*
==========================================================
 Assert No Error
==========================================================
*/

export function assertNoError(
    error: unknown,
    options:
        ErrorHandlerOptions = {},
): void {

    if (
        error === undefined ||
        error === null
    ) {

        return;

    }


    ErrorHandler.handleAndThrow(
        error,
        options,
    );

}


/*
==========================================================
 Is Retryable
==========================================================
*/

export function isErrorRetryable(
    error: unknown,
): boolean {

    const normalized =
        normalizeAURAError(
            error,
        );


    const code =
        normalized.code;


    if (
        !code
    ) {

        return false;

    }


    const metadata =
        getErrorCodeMetadata(
            code,
        );


    return Boolean(
        metadata?.retryable,
    );

}


/*
==========================================================
 Get Error Category
==========================================================
*/

export function getErrorCategory(
    error: unknown,
): ErrorCategory {

    const normalized =
        normalizeAURAError(
            error,
        );


    return (
        normalized.context?.category ??
        ErrorCategoryResolver.fromCode(
            normalized.code,
        )
    );

}


/*
==========================================================
 Get Error Code
==========================================================
*/

export function getErrorCode(
    error: unknown,
): ErrorCode | undefined {

    const normalized =
        normalizeAURAError(
            error,
        );


    return normalized.code;

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorHandler;
