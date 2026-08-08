/**
==========================================================
AURA Trade OS
Validation Error
Version : 0.0.8 Alpha

Perubahan dari 0.0.7: `expected`/`received` sebelumnya
ditaruh langsung sebagai `metadata.expected` - bentrok dengan
`ErrorClassificationMetadata.expected` (boolean, artinya
"apakah error ini sudah diperkirakan") yang maknanya beda
total dari "nilai yang seharusnya diterima validasi" (unknown)
yang dimaksud di sini. Sekarang ditaruh di `metadata.details`
sebagai `expectedValue`/`receivedValue`, tidak menabrak field
bernama sama yang sudah punya arti lain.
==========================================================
Validation-specific Error Model
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
 Validation Error Options
==========================================================
*/

export interface ValidationErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Field that failed validation.
     */
    readonly field?:
        string;

    /**
     * Path to the invalid value.
     *
     * Example:
     * "order.price"
     */
    readonly path?:
        string;

    /**
     * Validation rule name.
     *
     * Example:
     * "required"
     * "min"
     * "enum"
     */
    readonly rule?:
        string;

    /**
     * Expected value or type.
     */
    readonly expected?:
        unknown;

    /**
     * Actual received value.
     */
    readonly received?:
        unknown;

    /**
     * Human-readable validation message.
     */
    readonly validationMessage?:
        string;

    /**
     * Whether this validation failure is recoverable.
     */
    readonly recoverable?:
        boolean;

    /**
     * Whether this error came from a schema.
     */
    readonly schemaValidation?:
        boolean;

    /**
     * Schema name.
     */
    readonly schema?:
        string;

    /**
     * Validation source.
     *
     * Example:
     * request
     * configuration
     * order
     * market
     */
    readonly source?:
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
 Validation Error
==========================================================
*/

export class ValidationError
    extends AURAError {

    /*
    ======================================================
    Field
    ======================================================
    */

    public readonly field:
        string | undefined;


    /*
    ======================================================
    Path
    ======================================================
    */

    public readonly path:
        string | undefined;


    /*
    ======================================================
    Rule
    ======================================================
    */

    public readonly rule:
        string | undefined;


    /*
    ======================================================
    Expected
    ======================================================
    */

    public readonly expected:
        unknown;


    /*
    ======================================================
    Received
    ======================================================
    */

    public readonly received:
        unknown;


    /*
    ======================================================
    Validation Message
    ======================================================
    */

    public readonly validationMessage:
        string | undefined;


    /*
    ======================================================
    Recoverable
    ======================================================
    */

    public readonly recoverable:
        boolean;


    /*
    ======================================================
    Schema Validation
    ======================================================
    */

    public readonly schemaValidation:
        boolean;


    /*
    ======================================================
    Schema
    ======================================================
    */

    public readonly schema:
        string | undefined;


    /*
    ======================================================
    Source
    ======================================================
    */

    public readonly source:
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
    Constructor
    ======================================================
    */

    public constructor(
        message:
            string,
        options:
            ValidationErrorOptions = {},
    ) {

        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                options.source ??
                options.context?.source ??
                "validation",

            service:
                options.context?.service ??
                "validation-service",

            field:
                options.field ??
                options.context?.field,

            path:
                options.path ??
                options.context?.path,

            rule:
                options.rule ??
                options.context?.rule,

            schema:
                options.schema ??
                options.context?.schema,

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

            field:
                options.field ??
                options.metadata?.field,

            path:
                options.path ??
                options.metadata?.path,

            rule:
                options.rule ??
                options.metadata?.rule,

            recoverable:
                options.recoverable ??
                options.metadata?.recoverable,

            schemaValidation:
                options.schemaValidation ??
                options.metadata?.schemaValidation,

            schema:
                options.schema ??
                options.metadata?.schema,

            source:
                options.source ??
                options.metadata?.source,

            /*
            ==================================================
            `expected`/`received` SENGAJA tidak ditaruh sebagai
            metadata.expected langsung -
            ErrorClassificationMetadata.expected artinya
            "apakah error ini sudah diperkirakan" (boolean),
            beda total dari "nilai yang seharusnya diterima
            validasi" (unknown) yang dimaksud di sini. Ditaruh
            di metadata.details supaya tidak tabrakan makna.
            ==================================================
            */

            details: {

                ...(options.metadata?.details ?? {}),

                ...(options.expected !== undefined
                    ? { expectedValue: options.expected }
                    : {}),

                ...(options.received !== undefined
                    ? { receivedValue: options.received }
                    : {}),

            },

        };


        super(
            message,
            {

                code:
                    options.code,

                severity:
                    ErrorSeverity.WARNING,

                context,

                metadata,

                cause:
                    options.cause,

            },
        );


        this.name =
            "ValidationError";


        this.field =
            options.field;


        this.path =
            options.path;


        this.rule =
            options.rule;


        this.expected =
            options.expected;


        this.received =
            options.received;


        this.validationMessage =
            options.validationMessage;


        this.recoverable =
            options.recoverable ??
            true;


        this.schemaValidation =
            options.schemaValidation ??
            false;


        this.schema =
            options.schema;


        this.source =
            options.source;


        this.requestId =
            options.requestId;


        this.correlationId =
            options.correlationId;

    }


    /*
    ======================================================
    Get Field
    ======================================================
    */

    public getField():
        string | undefined {

        return this.field;

    }


    /*
    ======================================================
    Get Path
    ======================================================
    */

    public getPath():
        string | undefined {

        return this.path;

    }


    /*
    ======================================================
    Get Rule
    ======================================================
    */

    public getRule():
        string | undefined {

        return this.rule;

    }


    /*
    ======================================================
    Get Expected
    ======================================================
    */

    public getExpected():
        unknown {

        return this.expected;

    }


    /*
    ======================================================
    Get Received
    ======================================================
    */

    public getReceived():
        unknown {

        return this.received;

    }


    /*
    ======================================================
    Has Field
    ======================================================
    */

    public hasField(
        field:
            string,
    ):
        boolean {

        return (
            this.field ===
            field
        );

    }


    /*
    ======================================================
    Has Rule
    ======================================================
    */

    public hasRule(
        rule:
            string,
    ):
        boolean {

        return (
            this.rule ===
            rule
        );

    }


    /*
    ======================================================
    Is Schema Validation
    ======================================================
    */

    public isSchemaValidation():
        boolean {

        return this.schemaValidation;

    }


    /*
    ======================================================
    Is Recoverable
    ======================================================
    */

    public isRecoverable():
        boolean {

        return this.recoverable;

    }


    /*
    ======================================================
    Validation Target
    ======================================================
    */

    public getTarget():
        string {

        if (
            this.path
        ) {

            return this.path;

        }


        if (
            this.field
        ) {

            return this.field;

        }


        return "unknown";

    }


    /*
    ======================================================
    To Validation Object
    ======================================================
    */

    public toValidationObject():
        ValidationErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            field:
                this.field,

            path:
                this.path,

            rule:
                this.rule,

            expected:
                this.expected,

            received:
                this.received,

            validationMessage:
                this.validationMessage,

            recoverable:
                this.recoverable,

            schemaValidation:
                this.schemaValidation,

            schema:
                this.schema,

            source:
                this.source,

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
            ValidationErrorOptions = {},
    ):
        ValidationError {

        if (
            error instanceof
            ValidationError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            return new ValidationError(
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

            return new ValidationError(
                error,
                options,
            );

        }


        return new ValidationError(
            "Validation failed.",
            options,
        );

    }


    /*
    ======================================================
    Required Field
    ======================================================
    */

    public static required(
        field:
            string,
        options:
            Omit<
                ValidationErrorOptions,
                "field" | "rule"
            > = {},
    ):
        ValidationError {

        return new ValidationError(
            `${field} is required.`,
            {

                ...options,

                field,

                rule:
                    "required",

            },
        );

    }


    /*
    ======================================================
    Invalid Type
    ======================================================
    */

    public static invalidType(
        field:
            string,
        expected:
            string,
        received:
            unknown,
        options:
            Omit<
                ValidationErrorOptions,
                "field" |
                "rule" |
                "expected" |
                "received"
            > = {},
    ):
        ValidationError {

        return new ValidationError(
            `${field} must be of type ${expected}.`,
            {

                ...options,

                field,

                rule:
                    "type",

                expected,

                received,

            },
        );

    }


    /*
    ======================================================
    Invalid Value
    ======================================================
    */

    public static invalidValue(
        field:
            string,
        received:
            unknown,
        options:
            Omit<
                ValidationErrorOptions,
                "field" |
                "rule" |
                "received"
            > = {},
    ):
        ValidationError {

        return new ValidationError(
            `${field} contains an invalid value.`,
            {

                ...options,

                field,

                rule:
                    "value",

                received,

            },
        );

    }


    /*
    ======================================================
    Invalid Format
    ======================================================
    */

    public static invalidFormat(
        field:
            string,
        options:
            Omit<
                ValidationErrorOptions,
                "field" | "rule"
            > = {},
    ):
        ValidationError {

        return new ValidationError(
            `${field} has an invalid format.`,
            {

                ...options,

                field,

                rule:
                    "format",

            },
        );

    }


    /*
    ======================================================
    Out Of Range
    ======================================================
    */

    public static outOfRange(
        field:
            string,
        expected:
            unknown,
        received:
            unknown,
        options:
            Omit<
                ValidationErrorOptions,
                "field" |
                "rule" |
                "expected" |
                "received"
            > = {},
    ):
        ValidationError {

        return new ValidationError(
            `${field} is outside the allowed range.`,
            {

                ...options,

                field,

                rule:
                    "range",

                expected,

                received,

            },
        );

    }


    /*
    ======================================================
    Schema
    ======================================================
    */

    public static schema(
        schema:
            string,
        message:
            string =
                "Schema validation failed.",
        options:
            Omit<
                ValidationErrorOptions,
                "schema" |
                "schemaValidation"
            > = {},
    ):
        ValidationError {

        return new ValidationError(
            message,
            {

                ...options,

                schema,

                schemaValidation:
                    true,

            },
        );

    }


    /*
    ======================================================
    Nested Path
    ======================================================
    */

    public static path(
        path:
            string,
        message:
            string =
                "Validation failed.",
        options:
            Omit<
                ValidationErrorOptions,
                "path"
            > = {},
    ):
        ValidationError {

        return new ValidationError(
            message,
            {

                ...options,

                path,

            },
        );

    }

}


/*
==========================================================
 Serialized Validation Error
==========================================================
*/

export interface ValidationErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly field?:
        string;

    readonly path?:
        string;

    readonly rule?:
        string;

    readonly expected?:
        unknown;

    readonly received?:
        unknown;

    readonly validationMessage?:
        string;

    readonly recoverable:
        boolean;

    readonly schemaValidation:
        boolean;

    readonly schema?:
        string;

    readonly source?:
        string;

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

export function createValidationError(
    message:
        string,
    options:
        ValidationErrorOptions = {},
):
    ValidationError {

    return new ValidationError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize
==========================================================
*/

export function normalizeValidationError(
    error:
        unknown,
    options:
        ValidationErrorOptions = {},
):
    ValidationError {

    return ValidationError.from(
        error,
        options,
    );

}


/*
==========================================================
 Required Factory
==========================================================
*/

export function createRequiredValidationError(
    field:
        string,
    options:
        Omit<
            ValidationErrorOptions,
            "field" | "rule"
        > = {},
):
    ValidationError {

    return ValidationError.required(
        field,
        options,
    );

}


/*
==========================================================
 Invalid Type Factory
==========================================================
*/

export function createInvalidTypeValidationError(
    field:
        string,
    expected:
        string,
    received:
        unknown,
    options:
        Omit<
            ValidationErrorOptions,
            "field" |
            "rule" |
            "expected" |
            "received"
        > = {},
):
    ValidationError {

    return ValidationError.invalidType(
        field,
        expected,
        received,
        options,
    );

}


/*
==========================================================
 Invalid Value Factory
==========================================================
*/

export function createInvalidValueValidationError(
    field:
        string,
    received:
        unknown,
    options:
        Omit<
            ValidationErrorOptions,
            "field" |
            "rule" |
            "received"
        > = {},
):
    ValidationError {

    return ValidationError.invalidValue(
        field,
        received,
        options,
    );

}


/*
==========================================================
 Invalid Format Factory
==========================================================
*/

export function createInvalidFormatValidationError(
    field:
        string,
    options:
        Omit<
            ValidationErrorOptions,
            "field" | "rule"
        > = {},
):
    ValidationError {

    return ValidationError.invalidFormat(
        field,
        options,
    );

}


/*
==========================================================
 Range Factory
==========================================================
*/

export function createRangeValidationError(
    field:
        string,
    expected:
        unknown,
    received:
        unknown,
    options:
        Omit<
            ValidationErrorOptions,
            "field" |
            "rule" |
            "expected" |
            "received"
        > = {},
):
    ValidationError {

    return ValidationError.outOfRange(
        field,
        expected,
        received,
        options,
    );

}


/*
==========================================================
 Schema Factory
==========================================================
*/

export function createSchemaValidationError(
    schema:
        string,
    message:
        string =
            "Schema validation failed.",
    options:
        Omit<
            ValidationErrorOptions,
            "schema" |
            "schemaValidation"
        > = {},
):
    ValidationError {

    return ValidationError.schema(
        schema,
        message,
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isValidationError(
    error:
        unknown,
):
    error is ValidationError {

    return (
        error instanceof
        ValidationError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ValidationError;
