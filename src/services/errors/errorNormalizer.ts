/**
==========================================================
AURA Trade OS
Error Normalizer
Version : 0.0.7 Alpha
==========================================================
External Error -> AURAError Normalization
==========================================================
*/

import {
    AURAError,
    normalizeAURAError,
    isAURAError,
} from "./error";

import type {
    ErrorContext,
} from "./errorContext";

import {
    sanitizeErrorContext,
} from "./errorContext";

import type {
    ErrorCode,
} from "./errorCode";

import {
    getErrorCodeMetadata,
} from "./errorCode";

import type {
    ErrorCategory,
} from "./errorCategory";

import {
    ErrorCategoryResolver,
} from "./errorCategory";

import {
    mergeErrorMetadata,
} from "./errorMetadata";

import type {
    ErrorMetadata,
} from "./errorMetadata";


/*
==========================================================
 Normalizer Source
==========================================================
*/

export type ErrorNormalizerSource =
    | "unknown"
    | "javascript"
    | "typescript"
    | "network"
    | "http"
    | "exchange"
    | "database"
    | "storage"
    | "validation"
    | "scheduler"
    | "runtime"
    | "plugin"
    | "serialization"
    | "telemetry"
    | "external"
    | string;


/*
==========================================================
 Normalization Options
==========================================================
*/

export interface ErrorNormalizationOptions {

    /**
     * Optional source identifier.
     */
    readonly source?:
        ErrorNormalizerSource;

    /**
     * Optional fallback error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Optional category.
     */
    readonly category?:
        ErrorCategory;

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
     * Whether the context should be sanitized.
     *
     * Default: true
     */
    readonly sanitize?:
        boolean;

    /**
     * Whether cause should be preserved.
     *
     * Default: true
     */
    readonly preserveCause?:
        boolean;

    /**
     * Optional human-readable message.
     */
    readonly message?:
        string;

}


/*
==========================================================
 Normalized Error
==========================================================
*/

export interface NormalizedError {

    /**
     * Normalized AURA error.
     */
    readonly error:
        AURAError;

    /**
     * Original error.
     */
    readonly original:
        unknown;

    /**
     * Source classification.
     */
    readonly source:
        ErrorNormalizerSource;

    /**
     * Error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Error category.
     */
    readonly category:
        ErrorCategory;

    /**
     * Whether normalization changed the error.
     */
    readonly normalized:
        boolean;

}


/*
==========================================================
 Error Normalizer
==========================================================
*/

export class ErrorNormalizer {

    /*
    ======================================================
    Normalize
    ======================================================
    */

    public static normalize(
        input: unknown,
        options:
            ErrorNormalizationOptions = {},
    ): AURAError {

        /*
         * Already an AURAError:
         *
         * Do not destroy its identity. Only enrich it
         * with explicitly supplied context/metadata.
         */

        if (
            isAURAError(
                input,
            )
        ) {

            return this.enrich(
                input,
                options,
            );

        }


        /*
         * Extract the external error shape.
         */

        const extracted =
            this.extract(
                input,
            );


        /*
         * Resolve code and category.
         */

        const code =
            options.code ??
            extracted.code;


        const category =
            options.category ??
            this.resolveCategory(
                code,
                extracted.category,
            );


        /*
         * Resolve message.
         */

        const message =
            options.message ??
            extracted.message ??
            "Unknown error";


        /*
         * Resolve context.
         */

        const context =
            this.buildContext(
                extracted.context,
                options.context,
                options.source,
                category,
            );


        /*
         * Resolve metadata.
         */

        const metadata =
            mergeErrorMetadata(
                extracted.metadata,
                options.metadata,
            );


        /*
         * Resolve severity from metadata/code.
         */

        const severity =
            this.resolveSeverity(
                code,
                metadata,
            );


        return new AURAError(
            message,
            {

                code,

                severity,

                context,

                metadata,

                cause:
                    options.preserveCause === false
                        ? undefined
                        : this.resolveCause(
                            input,
                        ),

            },
        );

    }


    /*
    ======================================================
    Normalize With Result
    ======================================================
    */

    public static normalizeResult(
        input: unknown,
        options:
            ErrorNormalizationOptions = {},
    ): NormalizedError {

        const original =
            input;


        const error =
            this.normalize(
                input,
                options,
            );


        const source =
            options.source ??
            this.detectSource(
                input,
            );


        const code =
            error.code;


        const category =
            error.context?.category ??
            ErrorCategoryResolver.fromCode(
                code,
            );


        return {

            error,

            original,

            source,

            code,

            category,

            normalized:
                !isAURAError(
                    input,
                ) ||
                Boolean(
                    options.context ||
                    options.metadata ||
                    options.code ||
                    options.category,
                ),

        };

    }


    /*
    ======================================================
    Enrich Existing Error
    ======================================================
    */

    private static enrich(
        error: AURAError,
        options:
            ErrorNormalizationOptions,
    ): AURAError {

        const context =
            this.buildContext(
                error.context,
                options.context,
                options.source,
                options.category ??
                    error.context?.category,
            );


        const metadata =
            mergeErrorMetadata(
                error.metadata,
                options.metadata,
            );


        const code =
            options.code ??
            error.code;


        const severity =
            this.resolveSeverity(
                code,
                metadata,
                error.severity,
            );


        const message =
            options.message ??
            error.message;


        if (
            message === error.message &&
            code === error.code &&
            severity === error.severity &&
            metadata === error.metadata &&
            this.contextEqual(
                context,
                error.context,
            )
        ) {

            return error;

        }


        return new AURAError(
            message,
            {

                code,

                severity,

                context,

                metadata,

                cause:
                    options.preserveCause === false
                        ? undefined
                        : error.cause,

            },
        );

    }


    /*
    ======================================================
    Extract External Error
    ======================================================
    */

    private static extract(
        input: unknown,
    ): ExtractedError {

        if (
            input instanceof Error
        ) {

            return {

                name:
                    input.name,

                message:
                    input.message,

                stack:
                    input.stack,

                code:
                    this.extractCode(
                        input,
                    ),

                category:
                    this.extractCategory(
                        input,
                    ),

                context:
                    this.extractContext(
                        input,
                    ),

                metadata:
                    this.extractMetadata(
                        input,
                    ),

            };

        }


        if (
            typeof input === "string"
        ) {

            return {

                name:
                    "Error",

                message:
                    input,

            };

        }


        if (
            typeof input === "number" ||
            typeof input === "boolean" ||
            typeof input === "bigint"
        ) {

            return {

                name:
                    "Error",

                message:
                    String(
                        input,
                    ),

            };

        }


        if (
            input &&
            typeof input === "object"
        ) {

            return this.extractObject(
                input as Record<
                    string,
                    unknown
                >,
            );

        }


        return {

            name:
                "Error",

            message:
                "Unknown error",

        };

    }


    /*
    ======================================================
    Extract Object
    ======================================================
    */

    private static extractObject(
        object:
            Record<
                string,
                unknown
            >,
    ): ExtractedError {

        const response =
            this.getNestedObject(
                object,
                "response",
            );


        const data =
            this.getNestedObject(
                object,
                "data",
            );


        const errorObject =
            this.getNestedObject(
                object,
                "error",
            );


        const message =
            this.extractString(
                object.message,
            ) ??
            this.extractString(
                object.error_description,
            ) ??
            this.extractString(
                errorObject?.message,
            ) ??
            this.extractString(
                data?.message,
            ) ??
            this.extractString(
                response?.message,
            ) ??
            this.extractString(
                object.description,
            ) ??
            this.extractString(
                object.reason,
            );


        const code =
            this.extractCode(
                object,
            ) ??
            this.extractCode(
                errorObject,
            ) ??
            this.extractCode(
                data,
            ) ??
            this.extractCode(
                response,
            );


        const category =
            this.extractCategory(
                object,
            ) ??
            this.extractCategory(
                errorObject,
            ) ??
            this.extractCategory(
                data,
            ) ??
            this.extractCategory(
                response,
            );


        return {

            name:
                this.extractString(
                    object.name,
                ) ??
                "ExternalError",

            message:
                message ??
                "Unknown error",

            stack:
                this.extractString(
                    object.stack,
                ),

            code,

            category,

            context:
                this.extractContext(
                    object,
                ),

            metadata:
                this.extractMetadata(
                    object,
                ),

        };

    }


    /*
    ======================================================
    Extract Code
    ======================================================
    */

    private static extractCode(
        value:
            unknown,
    ): ErrorCode | undefined {

        if (
            !value ||
            typeof value !== "object"
        ) {

            return undefined;

        }


        const object =
            value as Record<
                string,
                unknown
            >;


        const candidates = [

            object.code,

            object.errorCode,

            object.error_code,

            object.type,

        ];


        for (
            const candidate
                of candidates
        ) {

            if (
                typeof candidate !==
                "string"
            ) {

                continue;

            }


            if (
                this.looksLikeErrorCode(
                    candidate,
                )
            ) {

                return candidate as
                    ErrorCode;

            }

        }


        return undefined;

    }


    /*
    ======================================================
    Extract Category
    ======================================================
    */

    private static extractCategory(
        value:
            unknown,
    ): ErrorCategory | undefined {

        if (
            !value ||
            typeof value !== "object"
        ) {

            return undefined;

        }


        const object =
            value as Record<
                string,
                unknown
            >;


        const category =
            object.category ??
            object.errorCategory ??
            object.error_category;


        if (
            typeof category !==
            "string"
        ) {

            return undefined;

        }


        return category as
            ErrorCategory;

    }


    /*
    ======================================================
    Extract Context
    ======================================================
    */

    private static extractContext(
        value:
            unknown,
    ): ErrorContext | undefined {

        if (
            !value ||
            typeof value !== "object"
        ) {

            return undefined;

        }


        const object =
            value as Record<
                string,
                unknown
            >;


        const context =
            object.context;


        if (
            !context ||
            typeof context !==
                "object"
        ) {

            return undefined;

        }


        return context as
            ErrorContext;

    }


    /*
    ======================================================
    Extract Metadata
    ======================================================
    */

    private static extractMetadata(
        value:
            unknown,
    ): ErrorMetadata | undefined {

        if (
            !value ||
            typeof value !== "object"
        ) {

            return undefined;

        }


        const object =
            value as Record<
                string,
                unknown
            >;


        const metadata =
            object.metadata;


        if (
            !metadata ||
            typeof metadata !==
                "object"
        ) {

            return undefined;

        }


        return metadata as
            ErrorMetadata;

    }


    /*
    ======================================================
    Extract String
    ======================================================
    */

    private static extractString(
        value:
            unknown,
    ): string | undefined {

        if (
            typeof value ===
            "string" &&
            value.trim()
        ) {

            return value.trim();

        }


        return undefined;

    }


    /*
    ======================================================
    Nested Object
    ======================================================
    */

    private static getNestedObject(
        value:
            Record<
                string,
                unknown
            >,
        key: string,
    ):
        Record<
            string,
            unknown
        > | undefined {

        const nested =
            value[key];


        if (
            !nested ||
            typeof nested !==
                "object"
        ) {

            return undefined;

        }


        return nested as
            Record<
                string,
                unknown
            >;

    }


    /*
    ======================================================
    Build Context
    ======================================================
    */

    private static buildContext(
        base:
            ErrorContext | undefined,
        extra:
            ErrorContext | undefined,
        source:
            ErrorNormalizerSource |
            undefined,
        category:
            ErrorCategory |
            undefined,
    ): ErrorContext {

        const context: ErrorContext = {

            ...(base ?? {}),

            ...(extra ?? {}),

        };


        if (
            source &&
            !context.source
        ) {

            context.source =
                source;

        }


        if (
            category &&
            !context.category
        ) {

            context.category =
                category;

        }


        return sanitizeErrorContext(
            context,
        );

    }


    /*
    ======================================================
    Resolve Category
    ======================================================
    */

    private static resolveCategory(
        code:
            ErrorCode | undefined,
        extracted:
            ErrorCategory | undefined,
    ): ErrorCategory {

        if (
            extracted
        ) {

            return extracted;

        }


        return ErrorCategoryResolver.fromCode(
            code,
        );

    }


    /*
    ======================================================
    Resolve Severity
    ======================================================
    */

    private static resolveSeverity(
        code:
            ErrorCode | undefined,
        metadata:
            ErrorMetadata | undefined,
        fallback:
            string = "error",
    ): string {

        const codeMetadata =
            code
                ? getErrorCodeMetadata(
                    code,
                )
                : undefined;


        return (
            metadata?.telemetrySeverity ??
            codeMetadata?.severity ??
            fallback
        );

    }


    /*
    ======================================================
    Resolve Cause
    ======================================================
    */

    private static resolveCause(
        input:
            unknown,
    ): unknown {

        if (
            input instanceof Error
        ) {

            return input;

        }


        return undefined;

    }


    /*
    ======================================================
    Detect Source
    ======================================================
    */

    private static detectSource(
        input:
            unknown,
    ): ErrorNormalizerSource {

        if (
            input instanceof TypeError
        ) {

            return "typescript";

        }


        if (
            input instanceof SyntaxError
        ) {

            return "javascript";

        }


        if (
            input instanceof RangeError
        ) {

            return "runtime";

        }


        if (
            input instanceof Error
        ) {

            return "javascript";

        }


        if (
            input &&
            typeof input ===
                "object"
        ) {

            const object =
                input as Record<
                    string,
                    unknown
                >;


            if (
                typeof object.status ===
                "number"
            ) {

                return "http";

            }


            if (
                typeof object.statusCode ===
                "number"
            ) {

                return "http";

            }


            if (
                typeof object.response ===
                "object"
            ) {

                return "external";

            }

        }


        return "unknown";

    }


    /*
    ======================================================
    Looks Like Code
    ======================================================
    */

    private static looksLikeErrorCode(
        value: string,
    ): boolean {

        return /^[A-Z][A-Z0-9_:-]{2,}$/.test(
            value,
        );

    }


    /*
    ======================================================
    Context Equality
    ======================================================
    */

    private static contextEqual(
        a:
            ErrorContext | undefined,
        b:
            ErrorContext | undefined,
    ): boolean {

        if (
            a === b
        ) {

            return true;

        }


        if (
            !a ||
            !b
        ) {

            return false;

        }


        try {

            return (
                JSON.stringify(
                    a,
                ) ===
                JSON.stringify(
                    b,
                )
            );

        } catch {

            return false;

        }

    }

}


/*
==========================================================
 Extracted Error
==========================================================
*/

interface ExtractedError {

    readonly name:
        string;

    readonly message:
        string;

    readonly stack?:
        string;

    readonly code?:
        ErrorCode;

    readonly category?:
        ErrorCategory;

    readonly context?:
        ErrorContext;

    readonly metadata?:
        ErrorMetadata;

}


/*
==========================================================
 Functional API
==========================================================
*/

export function normalizeError(
    input:
        unknown,
    options:
        ErrorNormalizationOptions = {},
): AURAError {

    return ErrorNormalizer.normalize(
        input,
        options,
    );

}


/*
==========================================================
 Normalize Result API
==========================================================
*/

export function normalizeErrorResult(
    input:
        unknown,
    options:
        ErrorNormalizationOptions = {},
): NormalizedError {

    return ErrorNormalizer.normalizeResult(
        input,
        options,
    );

}


/*
==========================================================
 Normalize HTTP Error
==========================================================
*/

export function normalizeHttpError(
    input:
        unknown,
    options:
        Omit<
            ErrorNormalizationOptions,
            "source"
        > = {},
): AURAError {

    return ErrorNormalizer.normalize(
        input,
        {

            ...options,

            source:
                "http",

        },
    );

}


/*
==========================================================
 Normalize Exchange Error
==========================================================
*/

export function normalizeExchangeError(
    input:
        unknown,
    options:
        Omit<
            ErrorNormalizationOptions,
            "source"
        > = {},
): AURAError {

    return ErrorNormalizer.normalize(
        input,
        {

            ...options,

            source:
                "exchange",

        },
    );

}


/*
==========================================================
 Normalize Validation Error
==========================================================
*/

export function normalizeValidationError(
    input:
        unknown,
    options:
        Omit<
            ErrorNormalizationOptions,
            "source"
        > = {},
): AURAError {

    return ErrorNormalizer.normalize(
        input,
        {

            ...options,

            source:
                "validation",

        },
    );

}


/*
==========================================================
 Normalize Runtime Error
==========================================================
*/

export function normalizeRuntimeError(
    input:
        unknown,
    options:
        Omit<
            ErrorNormalizationOptions,
            "source"
        > = {},
): AURAError {

    return ErrorNormalizer.normalize(
        input,
        {

            ...options,

            source:
                "runtime",

        },
    );

}


/*
==========================================================
 Normalize Scheduler Error
==========================================================
*/

export function normalizeSchedulerError(
    input:
        unknown,
    options:
        Omit<
            ErrorNormalizationOptions,
            "source"
        > = {},
): AURAError {

    return ErrorNormalizer.normalize(
        input,
        {

            ...options,

            source:
                "scheduler",

        },
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorNormalizer;
