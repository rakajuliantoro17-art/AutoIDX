/**
==========================================================
AURA Trade OS
Configuration Error
Version : 0.0.7 Alpha
==========================================================
Configuration Error Implementation
==========================================================
*/

import {
    OperationalError,
} from "./operationalError";

import type {
    ErrorContext,
} from "./errorContext";

import type {
    ErrorMetadata,
} from "./errorMetadata";

import type {
    ErrorSeverity,
} from "./errorSeverity";

import type {
    ErrorCode,
} from "./errorCode";


/*
==========================================================
Configuration Error Options
==========================================================
*/

export interface ConfigurationErrorOptions {

    /**
     * Configuration key that caused the error.
     *
     * Example:
     *
     * "INDODAX_API_KEY"
     * "TRADING_PAIR"
     */
    readonly key?: string;

    /**
     * Configuration source.
     *
     * Example:
     *
     * "environment"
     * "file"
     * "database"
     * "runtime"
     * "default"
     */
    readonly source?: string;

    /**
     * Expected configuration value.
     *
     * Never store secrets here.
     */
    readonly expected?: unknown;

    /**
     * Actual configuration value.
     *
     * Never store secrets here.
     */
    readonly actual?: unknown;

    /**
     * Whether the configuration is missing.
     */
    readonly missing?: boolean;

    /**
     * Whether the configuration is invalid.
     */
    readonly invalid?: boolean;

    /**
     * Whether the configuration is unsupported.
     */
    readonly unsupported?: boolean;

    /**
     * Original error.
     */
    readonly cause?: unknown;

    /**
     * Additional context.
     */
    readonly context?: ErrorContext;

    /**
     * Additional metadata.
     */
    readonly metadata?: ErrorMetadata;

    /**
     * Error severity.
     */
    readonly severity?: ErrorSeverity;

}


/*
==========================================================
Configuration Error
==========================================================
*/

export class ConfigurationError
    extends OperationalError {

    /**
     * Configuration key.
     */
    public readonly key?: string;

    /**
     * Configuration source.
     */
    public readonly source?: string;

    /**
     * Expected value.
     */
    public readonly expected?: unknown;

    /**
     * Actual value.
     */
    public readonly actual?: unknown;

    /**
     * Missing configuration.
     */
    public readonly missing: boolean;

    /**
     * Invalid configuration.
     */
    public readonly invalid: boolean;

    /**
     * Unsupported configuration.
     */
    public readonly unsupported: boolean;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        message: string,
        options: ConfigurationErrorOptions = {},
    ) {

        /*
        ==================================================
        Error Code
        ==================================================
        */

        const code =
            ConfigurationError.resolveCode(
                options,
            );


        /*
        ==================================================
        Super
        ==================================================
        */

        super(
            message,
            {
                code,
                severity:
                    options.severity ??
                    ConfigurationError.defaultSeverity(
                        options,
                    ),
                context:
                    options.context,
                metadata:
                    options.metadata,
                cause:
                    options.cause,
            },
        );


        /*
        ==================================================
        Properties
        ==================================================
        */

        this.name =
            "ConfigurationError";


        this.key =
            options.key;


        this.source =
            options.source;


        this.expected =
            options.expected;


        this.actual =
            options.actual;


        this.missing =
            options.missing === true;


        this.invalid =
            options.invalid === true;


        this.unsupported =
            options.unsupported === true;


        /*
        ==================================================
        Prototype
        ==================================================
        */

        Object.setPrototypeOf(
            this,
            new.target.prototype,
        );

    }


    /*
    ======================================================
    Missing
    ======================================================
    */

    public static missing(
        key: string,
        options: Omit<
            ConfigurationErrorOptions,
            "key" | "missing"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Required configuration "${key}" is missing.`,

            {
                ...options,

                key,

                missing: true,

            },

        );

    }


    /*
    ======================================================
    Invalid
    ======================================================
    */

    public static invalid(
        key: string,
        actual?: unknown,
        options: Omit<
            ConfigurationErrorOptions,
            "key" | "actual" | "invalid"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Configuration "${key}" is invalid.`,

            {
                ...options,

                key,

                actual,

                invalid: true,

            },

        );

    }


    /*
    ======================================================
    Unsupported
    ======================================================
    */

    public static unsupported(
        key: string,
        actual?: unknown,
        options: Omit<
            ConfigurationErrorOptions,
            "key" | "actual" | "unsupported"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Configuration "${key}" contains an unsupported value.`,

            {
                ...options,

                key,

                actual,

                unsupported: true,

            },

        );

    }


    /*
    ======================================================
    Invalid Type
    ======================================================
    */

    public static invalidType(
        key: string,
        expected: string,
        actual: unknown,
        options: Omit<
            ConfigurationErrorOptions,
            "key" | "expected" | "actual" | "invalid"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Configuration "${key}" must be ${expected}.`,

            {
                ...options,

                key,

                expected,

                actual,

                invalid: true,

            },

        );

    }


    /*
    ======================================================
    Invalid Value
    ======================================================
    */

    public static invalidValue(
        key: string,
        expected: unknown,
        actual: unknown,
        options: Omit<
            ConfigurationErrorOptions,
            "key" |
            "expected" |
            "actual" |
            "invalid"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Configuration "${key}" contains an invalid value.`,

            {
                ...options,

                key,

                expected,

                actual,

                invalid: true,

            },

        );

    }


    /*
    ======================================================
    Environment
    ======================================================
    */

    public static environment(
        key: string,
        options: Omit<
            ConfigurationErrorOptions,
            "key" | "source"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Environment configuration "${key}" is invalid.`,

            {
                ...options,

                key,

                source: "environment",

            },

        );

    }


    /*
    ======================================================
    Runtime
    ======================================================
    */

    public static runtime(
        key: string,
        options: Omit<
            ConfigurationErrorOptions,
            "key" | "source"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Runtime configuration "${key}" is invalid.`,

            {
                ...options,

                key,

                source: "runtime",

            },

        );

    }


    /*
    ======================================================
    Trading
    ======================================================
    */

    public static trading(
        key: string,
        options: Omit<
            ConfigurationErrorOptions,
            "key"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Trading configuration "${key}" is invalid.`,

            {
                ...options,

                key,

            },

        );

    }


    /*
    ======================================================
    API
    ======================================================
    */

    public static api(
        key: string,
        options: Omit<
            ConfigurationErrorOptions,
            "key"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `API configuration "${key}" is invalid.`,

            {
                ...options,

                key,

            },

        );

    }


    /*
    ======================================================
    Strategy
    ======================================================
    */

    public static strategy(
        key: string,
        options: Omit<
            ConfigurationErrorOptions,
            "key"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Strategy configuration "${key}" is invalid.`,

            {
                ...options,

                key,

            },

        );

    }


    /*
    ======================================================
    Risk
    ======================================================
    */

    public static risk(
        key: string,
        options: Omit<
            ConfigurationErrorOptions,
            "key"
        > = {},
    ): ConfigurationError {

        return new ConfigurationError(

            `Risk configuration "${key}" is invalid.`,

            {
                ...options,

                key,

            },

        );

    }


    /*
    ======================================================
    Is Configuration Error
    ======================================================
    */

    public static isConfigurationError(
        error: unknown,
    ): error is ConfigurationError {

        return (
            error instanceof ConfigurationError
        );

    }


    /*
    ======================================================
    Resolve Code
    ======================================================
    */

    private static resolveCode(
        options: ConfigurationErrorOptions,
    ): ErrorCode {

        /*
        ==================================================
        Prefer explicit code through inherited metadata
        ==================================================
        */

        const metadataCode =
            options.metadata?.["code"];


        if (
            typeof metadataCode === "string"
        ) {

            return metadataCode as ErrorCode;

        }


        /*
        ==================================================
        Missing
        ==================================================
        */

        if (
            options.missing
        ) {

            return "CONFIGURATION_MISSING" as ErrorCode;

        }


        /*
        ==================================================
        Unsupported
        ==================================================
        */

        if (
            options.unsupported
        ) {

            return "CONFIGURATION_UNSUPPORTED" as ErrorCode;

        }


        /*
        ==================================================
        Invalid
        ==================================================
        */

        if (
            options.invalid
        ) {

            return "CONFIGURATION_INVALID" as ErrorCode;

        }


        /*
        ==================================================
        Default
        ==================================================
        */

        return "CONFIGURATION_ERROR" as ErrorCode;

    }


    /*
    ======================================================
    Default Severity
    ======================================================
    */

    private static defaultSeverity(
        options: ConfigurationErrorOptions,
    ): ErrorSeverity {

        /*
        ==================================================
        Missing configuration is normally critical during
        application startup.
        ==================================================
        */

        if (
            options.missing
        ) {

            return "critical" as ErrorSeverity;

        }


        /*
        ==================================================
        Unsupported configuration prevents reliable
        execution.
        ==================================================
        */

        if (
            options.unsupported
        ) {

            return "error" as ErrorSeverity;

        }


        /*
        ==================================================
        Invalid configuration is an operational error.
        ==================================================
        */

        return "error" as ErrorSeverity;

    }

}


/*
==========================================================
Type Guard
==========================================================
*/

export function isConfigurationError(
    error: unknown,
): error is ConfigurationError {

    return (
        error instanceof ConfigurationError
    );

}
