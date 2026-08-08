/**
==========================================================
AURA Trade OS
Error Serializer
Version : 0.0.7 Alpha
==========================================================
Structured Error Serialization
==========================================================
*/

import {
    isAURAError,
} from "./error";

import type {
    AURAError,
} from "./error";

import type {
    ErrorContext,
} from "./errorContext";

import {
    sanitizeErrorContext,
} from "./errorContext";

import type {
    ErrorMetadata,
} from "./errorMetadata";

import {
    sanitizeErrorMetadata,
} from "./errorMetadata";

import type {
    ErrorCode,
} from "./errorCode";

import type {
    ErrorCategory,
} from "./errorCategory";


/*
==========================================================
 Serialization Format
==========================================================
*/

export type ErrorSerializationFormat =
    | "json"
    | "compact"
    | "log"
    | "telemetry"
    | "api"
    | "storage";


/*
==========================================================
 Serialization Options
==========================================================
*/

export interface ErrorSerializationOptions {

    /**
     * Serialization format.
     *
     * Default: json
     */
    readonly format?:
        ErrorSerializationFormat;

    /**
     * Include stack trace.
     *
     * Default: true.
     */
    readonly includeStack?:
        boolean;

    /**
     * Include error cause.
     *
     * Default: false.
     */
    readonly includeCause?:
        boolean;

    /**
     * Include context.
     *
     * Default: true.
     */
    readonly includeContext?:
        boolean;

    /**
     * Include metadata.
     *
     * Default: true.
     */
    readonly includeMetadata?:
        boolean;

    /**
     * Sanitize sensitive fields.
     *
     * Default: true.
     */
    readonly sanitize?:
        boolean;

    /**
     * Include timestamp.
     *
     * Default: true.
     */
    readonly includeTimestamp?:
        boolean;

    /**
     * Include name.
     *
     * Default: true.
     */
    readonly includeName?:
        boolean;

    /**
     * Include message.
     *
     * Default: true.
     */
    readonly includeMessage?:
        boolean;

}


/*
==========================================================
 Serialized Error
==========================================================
*/

export interface SerializedError {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly category?:
        ErrorCategory;

    readonly severity?:
        string;

    readonly timestamp?:
        string;

    readonly stack?:
        string;

    readonly context?:
        ErrorContext;

    readonly metadata?:
        ErrorMetadata;

    readonly cause?:
        SerializedError | string;

}


/*
==========================================================
 Compact Error
==========================================================
*/

export interface CompactSerializedError {

    readonly code?:
        ErrorCode;

    readonly message:
        string;

    readonly category?:
        ErrorCategory;

    readonly severity?:
        string;

}


/*
==========================================================
 API Error
==========================================================
*/

export interface ApiSerializedError {

    readonly error:
        true;

    readonly code?:
        ErrorCode;

    readonly message:
        string;

    readonly category?:
        ErrorCategory;

    readonly requestId?:
        string;

}


/*
==========================================================
 Telemetry Error
==========================================================
*/

export interface TelemetrySerializedError {

    readonly event:
        "error";

    readonly timestamp:
        string;

    readonly code?:
        ErrorCode;

    readonly category?:
        ErrorCategory;

    readonly severity?:
        string;

    readonly message:
        string;

    readonly context?:
        ErrorContext;

    readonly metadata?:
        ErrorMetadata;

}


/*
==========================================================
 Error Serializer
==========================================================
*/

export class ErrorSerializer {


    /*
    ======================================================
    Serialize
    ======================================================
    */

    public static serialize(
        error:
            unknown,
        options:
            ErrorSerializationOptions = {},
    ):
        SerializedError |
        CompactSerializedError |
        ApiSerializedError |
        TelemetrySerializedError {

        const normalized =
            this.normalizeInput(
                error,
            );


        const format =
            options.format ??
            "json";


        switch (
            format
        ) {

            case "compact":

                return this.serializeCompact(
                    normalized,
                    options,
                );


            case "log":

                return this.serializeLogObject(
                    normalized,
                    options,
                );


            case "telemetry":

                return this.serializeTelemetry(
                    normalized,
                    options,
                );


            case "api":

                return this.serializeApi(
                    normalized,
                    options,
                );


            case "storage":

                return this.serializeStorage(
                    normalized,
                    options,
                );


            case "json":

            default:

                return this.serializeJson(
                    normalized,
                    options,
                );

        }

    }


    /*
    ======================================================
    JSON Serialization
    ======================================================
    */

    private static serializeJson(
        error:
            AURAError,
        options:
            ErrorSerializationOptions,
    ): SerializedError {

        const result:
            Record<
                string,
                unknown
            > = {};


        if (
            options.includeName !== false
        ) {

            result.name =
                error.name;

        }


        if (
            options.includeMessage !== false
        ) {

            result.message =
                error.message;

        }


        if (
            error.code !== undefined
        ) {

            result.code =
                error.code;

        }


        const category =
            this.getCategory(
                error,
            );


        if (
            category !== undefined
        ) {

            result.category =
                category;

        }


        if (
            error.severity !== undefined
        ) {

            result.severity =
                error.severity;

        }


        if (
            options.includeTimestamp !== false
        ) {

            result.timestamp =
                new Date().toISOString();

        }


        if (
            options.includeStack !== false &&
            error.stack
        ) {

            result.stack =
                error.stack;

        }


        if (
            options.includeContext !== false &&
            error.context
        ) {

            result.context =
                options.sanitize === false
                    ? error.context
                    : sanitizeErrorContext(
                        error.context,
                    );

        }


        if (
            options.includeMetadata !== false &&
            error.metadata
        ) {

            result.metadata =
                options.sanitize === false
                    ? error.metadata
                    : sanitizeErrorMetadata(
                        error.metadata,
                    );

        }


        if (
            options.includeCause === true &&
            error.cause
        ) {

            result.cause =
                this.serializeCause(
                    error.cause,
                    options,
                );

        }


        return result as
            SerializedError;

    }


    /*
    ======================================================
    Compact Serialization
    ======================================================
    */

    private static serializeCompact(
        error:
            AURAError,
        options:
            ErrorSerializationOptions,
    ): CompactSerializedError {

        return {

            code:
                error.code,

            message:
                error.message,

            category:
                this.getCategory(
                    error,
                ),

            severity:
                error.severity,

        };

    }


    /*
    ======================================================
    Log Serialization
    ======================================================
    */

    private static serializeLogObject(
        error:
            AURAError,
        options:
            ErrorSerializationOptions,
    ): SerializedError {

        return this.serializeJson(
            error,
            {

                ...options,

                format:
                    "log",

                includeStack:
                    options.includeStack ??
                    true,

                includeContext:
                    options.includeContext ??
                    true,

                includeMetadata:
                    options.includeMetadata ??
                    true,

                includeCause:
                    false,

            },
        );

    }


    /*
    ======================================================
    Telemetry Serialization
    ======================================================
    */

    private static serializeTelemetry(
        error:
            AURAError,
        options:
            ErrorSerializationOptions,
    ): TelemetrySerializedError {

        const timestamp =
            new Date().toISOString();


        return {

            event:
                "error",

            timestamp,

            code:
                error.code,

            category:
                this.getCategory(
                    error,
                ),

            severity:
                error.severity,

            message:
                error.message,

            context:
                options.includeContext === false
                    ? undefined
                    : options.sanitize === false
                        ? error.context
                        : error.context
                            ? sanitizeErrorContext(
                                error.context,
                            )
                            : undefined,

            metadata:
                options.includeMetadata === false
                    ? undefined
                    : options.sanitize === false
                        ? error.metadata
                        : error.metadata
                            ? sanitizeErrorMetadata(
                                error.metadata,
                            )
                            : undefined,

        };

    }


    /*
    ======================================================
    API Serialization
    ======================================================
    */

    private static serializeApi(
        error:
            AURAError,
        options:
            ErrorSerializationOptions,
    ): ApiSerializedError {

        const requestId =
            this.extractRequestId(
                error.context,
            );


        return {

            error:
                true,

            code:
                error.code,

            message:
                error.message,

            category:
                this.getCategory(
                    error,
                ),

            requestId,

        };

    }


    /*
    ======================================================
    Storage Serialization
    ======================================================
    */

    private static serializeStorage(
        error:
            AURAError,
        options:
            ErrorSerializationOptions,
    ): SerializedError {

        return this.serializeJson(
            error,
            {

                ...options,

                format:
                    "storage",

                includeStack:
                    options.includeStack ??
                    false,

                includeCause:
                    false,

                includeTimestamp:
                    options.includeTimestamp ??
                    true,

            },
        );

    }


    /*
    ======================================================
    Serialize To JSON
    ======================================================
    */

    public static toJSON(
        error:
            unknown,
        options:
            Omit<
                ErrorSerializationOptions,
                "format"
            > = {},
    ): string {

        const serialized =
            this.serialize(
                error,
                {

                    ...options,

                    format:
                        "json",

                },
            );


        return JSON.stringify(
            serialized,
        );

    }


    /*
    ======================================================
    Serialize To Pretty JSON
    ======================================================
    */

    public static toPrettyJSON(
        error:
            unknown,
        options:
            Omit<
                ErrorSerializationOptions,
                "format"
            > = {},
    ): string {

        const serialized =
            this.serialize(
                error,
                {

                    ...options,

                    format:
                        "json",

                },
            );


        return JSON.stringify(
            serialized,
            null,
            2,
        );

    }


    /*
    ======================================================
    Serialize To Compact JSON
    ======================================================
    */

    public static toCompactJSON(
        error:
            unknown,
    ): string {

        const serialized =
            this.serialize(
                error,
                {

                    format:
                        "compact",

                },
            );


        return JSON.stringify(
            serialized,
        );

    }


    /*
    ======================================================
    Serialize For API
    ======================================================
    */

    public static toApi(
        error:
            unknown,
    ): ApiSerializedError {

        return this.serialize(
            error,
            {

                format:
                    "api",

                includeStack:
                    false,

                includeCause:
                    false,

                includeContext:
                    false,

                includeMetadata:
                    false,

            },
        ) as ApiSerializedError;

    }


    /*
    ======================================================
    Serialize For Telemetry
    ======================================================
    */

    public static toTelemetry(
        error:
            unknown,
    ): TelemetrySerializedError {

        return this.serialize(
            error,
            {

                format:
                    "telemetry",

                includeStack:
                    false,

                includeCause:
                    false,

                sanitize:
                    true,

            },
        ) as TelemetrySerializedError;

    }


    /*
    ======================================================
    Serialize For Storage
    ======================================================
    */

    public static toStorage(
        error:
            unknown,
    ): SerializedError {

        return this.serialize(
            error,
            {

                format:
                    "storage",

                includeStack:
                    false,

                includeCause:
                    false,

                sanitize:
                    true,

            },
        ) as SerializedError;

    }


    /*
    ======================================================
    Serialize Cause
    ======================================================
    */

    private static serializeCause(
        cause:
            unknown,
        options:
            ErrorSerializationOptions,
    ):
        SerializedError |
        string {

        if (
            isAURAError(
                cause,
            )
        ) {

            return this.serializeJson(
                cause,
                {

                    ...options,

                    includeCause:
                        false,

                },
            );

        }


        if (
            cause instanceof Error
        ) {

            const result:
                Record<
                    string,
                    unknown
                > = {

                    name:
                        cause.name,

                    message:
                        cause.message,

                };


            if (
                options.includeStack !== false &&
                cause.stack
            ) {

                result.stack =
                    cause.stack;

            }


            return result as
                SerializedError;

        }


        if (
            typeof cause ===
            "string"
        ) {

            return cause;

        }


        return String(
            cause,
        );

    }


    /*
    ======================================================
    Normalize Input
    ======================================================
    */

    private static normalizeInput(
        input:
            unknown,
    ): AURAError {

        if (
            isAURAError(
                input,
            )
        ) {

            return input;

        }


        if (
            input instanceof Error
        ) {

            /*
             * We intentionally avoid importing the
             * normalizer here to keep serializer
             * responsibilities minimal.
             */

            return this.fromNativeError(
                input,
            );

        }


        if (
            typeof input ===
            "string"
        ) {

            return this.createFallbackError(
                input,
            );

        }


        return this.createFallbackError(
            "Unknown error",
        );

    }


    /*
    ======================================================
    Native Error Conversion
    ======================================================
    */

    private static fromNativeError(
        error:
            Error,
    ): AURAError {

        return new AURAError(
            error.message ||
                "Unknown error",
            {

                cause:
                    error,

            },
        );

    }


    /*
    ======================================================
    Fallback Error
    ======================================================
    */

    private static createFallbackError(
        message:
            string,
    ): AURAError {

        return new AURAError(
            message,
        );

    }


    /*
    ======================================================
    Category
    ======================================================
    */

    private static getCategory(
        error:
            AURAError,
    ):
        ErrorCategory |
        undefined {

        return (
            error.context?.category ??
            error.metadata?.category
        );

    }


    /*
    ======================================================
    Request ID
    ======================================================
    */

    private static extractRequestId(
        context:
            ErrorContext |
            undefined,
    ): string | undefined {

        if (
            !context
        ) {

            return undefined;

        }


        const possibleKeys = [

            "requestId",

            "requestID",

            "correlationId",

            "correlationID",

            "traceId",

            "traceID",

        ];


        const record =
            context as
                Record<
                    string,
                    unknown
                >;


        for (
            const key
                of possibleKeys
        ) {

            const value =
                record[key];


            if (
                typeof value ===
                "string" &&
                value.length > 0
            ) {

                return value;

            }

        }


        return undefined;

    }

}


/*
==========================================================
 Functional API
==========================================================
*/

export function serializeError(
    error:
        unknown,
    options:
        ErrorSerializationOptions = {},
):
    SerializedError |
    CompactSerializedError |
    ApiSerializedError |
    TelemetrySerializedError {

    return ErrorSerializer.serialize(
        error,
        options,
    );

}


/*
==========================================================
 JSON API
==========================================================
*/

export function serializeErrorJSON(
    error:
        unknown,
    options:
        Omit<
            ErrorSerializationOptions,
            "format"
        > = {},
): string {

    return ErrorSerializer.toJSON(
        error,
        options,
    );

}


/*
==========================================================
 Pretty JSON API
==========================================================
*/

export function serializeErrorPrettyJSON(
    error:
        unknown,
    options:
        Omit<
            ErrorSerializationOptions,
            "format"
        > = {},
): string {

    return ErrorSerializer.toPrettyJSON(
        error,
        options,
    );

}


/*
==========================================================
 Compact JSON API
==========================================================
*/

export function serializeErrorCompactJSON(
    error:
        unknown,
): string {

    return ErrorSerializer.toCompactJSON(
        error,
    );

}


/*
==========================================================
 API Error
==========================================================
*/

export function serializeErrorForApi(
    error:
        unknown,
): ApiSerializedError {

    return ErrorSerializer.toApi(
        error,
    );

}


/*
==========================================================
 Telemetry Error
==========================================================
*/

export function serializeErrorForTelemetry(
    error:
        unknown,
): TelemetrySerializedError {

    return ErrorSerializer.toTelemetry(
        error,
    );

}


/*
==========================================================
 Storage Error
==========================================================
*/

export function serializeErrorForStorage(
    error:
        unknown,
): SerializedError {

    return ErrorSerializer.toStorage(
        error,
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorSerializer;
