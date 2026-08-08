/**
==========================================================
AURA Trade OS
Error Factory
Version : 0.0.7 Alpha
==========================================================
Centralized Error Construction
==========================================================
*/

import {
    AURAError,
    normalizeAURAError,
} from "./error";

import type {
    AURAErrorOptions,
} from "./error";

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

import type {
    ErrorContext,
} from "./errorContext";

import {
    createErrorContext,
    mergeErrorContext,
} from "./errorContext";

import type {
    ErrorMetadata,
} from "./errorMetadata";

import type {
    ErrorSeverity,
} from "./errorSeverity";


/*
==========================================================
Factory Options
==========================================================
*/

export interface ErrorFactoryOptions
    extends AURAErrorOptions {

    /**
     * Error code.
     */
    readonly code?: ErrorCode;

    /**
     * Error category.
     *
     * If omitted, category is inferred from code.
     */
    readonly category?: ErrorCategory;

    /**
     * Whether the error should be considered retryable.
     */
    readonly retryable?: boolean;

}


/*
==========================================================
Factory Result
==========================================================
*/

export interface ErrorFactoryResult {

    readonly error: AURAError;

    readonly code?: ErrorCode;

    readonly category: ErrorCategory;

    readonly severity?: ErrorSeverity;

    readonly retryable: boolean;

}


/*
==========================================================
 Error Factory
==========================================================
*/

export class ErrorFactory {

    /*
    ======================================================
    Create
    ======================================================
    */

    public static create(
        message: string,
        options:
            ErrorFactoryOptions = {},
    ): AURAError {

        const code =
            options.code;


        const category =
            options.category ??
            ErrorCategoryResolver.fromCode(
                code,
            );


        const metadata =
            code
                ? getErrorCodeMetadata(
                    code,
                )
                : undefined;


        const context =
            this.buildContext(
                options,
                category,
            );


        const error =
            new AURAError(
                message,
                {

                    ...options,

                    code,

                    context,

                    metadata:
                        this.buildMetadata(
                            options.metadata,
                            {
                                category,
                                retryable:
                                    options.retryable ??
                                    metadata?.retryable ??
                                    false,
                            },
                        ),

                },
            );


        return error;

    }


    /*
    ======================================================
    Create From Unknown
    ======================================================
    */

    public static fromUnknown(
        error: unknown,
        options:
            ErrorFactoryOptions = {},
    ): AURAError {

        const normalized =
            normalizeAURAError(
                error,
            );


        const code =
            options.code ??
            normalized.code;


        const category =
            options.category ??
            normalized.context?.category ??
            ErrorCategoryResolver.fromCode(
                code,
            );


        const context =
            mergeErrorContext(
                normalized.context,
                this.buildContext(
                    options,
                    category,
                ),
            );


        return new AURAError(
            options.message ??
                normalized.message,
            {

                code,

                severity:
                    options.severity ??
                    normalized.severity,

                context,

                metadata:
                    this.buildMetadata(
                        normalized.metadata,
                        options.metadata,
                    ),

                cause:
                    options.cause ??
                    normalized.cause ??
                    error,

            },
        );

    }


    /*
    ======================================================
    Create From Error
    ======================================================
    */

    public static fromError(
        error: Error,
        options:
            ErrorFactoryOptions = {},
    ): AURAError {

        return this.fromUnknown(
            error,
            options,
        );

    }


    /*
    ======================================================
    Configuration
    ======================================================
    */

    public static configuration(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "CONFIGURATION_ERROR"
                    | "CONFIGURATION_MISSING"
                    | "CONFIGURATION_INVALID"
                    | "CONFIGURATION_UNSUPPORTED"
                    | "CONFIGURATION_TYPE_INVALID"
                    | "CONFIGURATION_VALUE_INVALID"
                    | "CONFIGURATION_ENVIRONMENT_INVALID"
                    | "CONFIGURATION_RUNTIME_INVALID";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "CONFIGURATION_ERROR",

                category:
                    "configuration",

            },
        );

    }


    /*
    ======================================================
    Validation
    ======================================================
    */

    public static validation(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "VALIDATION_ERROR"
                    | "VALIDATION_FAILED"
                    | "VALIDATION_SCHEMA_INVALID"
                    | "VALIDATION_RULE_INVALID"
                    | "VALIDATION_REQUIRED"
                    | "VALIDATION_TYPE_MISMATCH"
                    | "VALIDATION_FORMAT_INVALID"
                    | "VALIDATION_RANGE_INVALID";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "VALIDATION_ERROR",

                category:
                    "validation",

            },
        );

    }


    /*
    ======================================================
    Network
    ======================================================
    */

    public static network(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "NETWORK_ERROR"
                    | "NETWORK_UNAVAILABLE"
                    | "NETWORK_TIMEOUT"
                    | "NETWORK_CONNECTION_FAILED"
                    | "NETWORK_CONNECTION_RESET"
                    | "NETWORK_DNS_FAILED"
                    | "NETWORK_PROTOCOL_ERROR";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "NETWORK_ERROR",

                category:
                    "network",

            },
        );

    }


    /*
    ======================================================
    Exchange
    ======================================================
    */

    public static exchange(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "EXCHANGE_ERROR"
                    | "EXCHANGE_UNAVAILABLE"
                    | "EXCHANGE_AUTHENTICATION_FAILED"
                    | "EXCHANGE_AUTHORIZATION_FAILED"
                    | "EXCHANGE_REQUEST_FAILED"
                    | "EXCHANGE_RESPONSE_INVALID"
                    | "EXCHANGE_RATE_LIMIT"
                    | "EXCHANGE_TIMEOUT"
                    | "EXCHANGE_CONNECTION_FAILED"
                    | "EXCHANGE_BALANCE_UNAVAILABLE"
                    | "EXCHANGE_ORDER_FAILED"
                    | "EXCHANGE_ORDER_REJECTED"
                    | "EXCHANGE_ORDER_NOT_FOUND"
                    | "EXCHANGE_ORDER_CANCEL_FAILED"
                    | "EXCHANGE_MARKET_UNAVAILABLE";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "EXCHANGE_ERROR",

                category:
                    "exchange",

            },
        );

    }


    /*
    ======================================================
    Market
    ======================================================
    */

    public static market(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "MARKET_ERROR"
                    | "MARKET_DATA_UNAVAILABLE"
                    | "MARKET_DATA_INVALID"
                    | "MARKET_DATA_STALE"
                    | "MARKET_TICKER_UNAVAILABLE"
                    | "MARKET_CANDLE_UNAVAILABLE"
                    | "MARKET_ORDERBOOK_UNAVAILABLE"
                    | "MARKET_SYMBOL_INVALID"
                    | "MARKET_PAIR_UNSUPPORTED"
                    | "MARKET_INTERVAL_UNSUPPORTED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "MARKET_ERROR",

                category:
                    "market",

            },
        );

    }


    /*
    ======================================================
    Order
    ======================================================
    */

    public static order(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "ORDER_ERROR"
                    | "ORDER_INVALID"
                    | "ORDER_NOT_FOUND"
                    | "ORDER_REJECTED"
                    | "ORDER_CANCEL_FAILED"
                    | "ORDER_SUBMIT_FAILED"
                    | "ORDER_SIZE_INVALID"
                    | "ORDER_PRICE_INVALID"
                    | "ORDER_SIDE_INVALID"
                    | "ORDER_TYPE_INVALID"
                    | "ORDER_BALANCE_INSUFFICIENT"
                    | "ORDER_MARKET_CLOSED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "ORDER_ERROR",

                category:
                    "order",

            },
        );

    }


    /*
    ======================================================
    Portfolio
    ======================================================
    */

    public static portfolio(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "PORTFOLIO_ERROR"
                    | "PORTFOLIO_UNAVAILABLE"
                    | "PORTFOLIO_STATE_INVALID"
                    | "PORTFOLIO_BALANCE_INVALID"
                    | "PORTFOLIO_POSITION_INVALID"
                    | "PORTFOLIO_POSITION_NOT_FOUND"
                    | "PORTFOLIO_UPDATE_FAILED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "PORTFOLIO_ERROR",

                category:
                    "portfolio",

            },
        );

    }


    /*
    ======================================================
    Strategy
    ======================================================
    */

    public static strategy(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "STRATEGY_ERROR"
                    | "STRATEGY_INVALID"
                    | "STRATEGY_NOT_FOUND"
                    | "STRATEGY_DISABLED"
                    | "STRATEGY_CONFIGURATION_INVALID"
                    | "STRATEGY_EXECUTION_FAILED"
                    | "STRATEGY_SIGNAL_INVALID"
                    | "STRATEGY_SIGNAL_UNAVAILABLE"
                    | "STRATEGY_INDICATOR_UNAVAILABLE"
                    | "STRATEGY_MARKET_DATA_UNAVAILABLE";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "STRATEGY_ERROR",

                category:
                    "strategy",

            },
        );

    }


    /*
    ======================================================
    Risk
    ======================================================
    */

    public static risk(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "RISK_ERROR"
                    | "RISK_LIMIT_EXCEEDED"
                    | "RISK_CONFIGURATION_INVALID"
                    | "RISK_EVALUATION_FAILED"
                    | "RISK_CHECK_FAILED"
                    | "RISK_POSITION_LIMIT"
                    | "RISK_EXPOSURE_LIMIT"
                    | "RISK_DRAWDOWN_LIMIT"
                    | "RISK_DAILY_LOSS_LIMIT"
                    | "RISK_TRADE_SIZE_LIMIT"
                    | "RISK_VOLATILITY_TOO_HIGH";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "RISK_ERROR",

                category:
                    "risk",

            },
        );

    }


    /*
    ======================================================
    Runtime
    ======================================================
    */

    public static runtime(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "RUNTIME_ERROR"
                    | "RUNTIME_INITIALIZATION_FAILED"
                    | "RUNTIME_START_FAILED"
                    | "RUNTIME_STOP_FAILED"
                    | "RUNTIME_NOT_READY"
                    | "RUNTIME_INVALID_STATE"
                    | "RUNTIME_RESOURCE_UNAVAILABLE"
                    | "RUNTIME_DEPENDENCY_FAILED"
                    | "RUNTIME_EXECUTION_FAILED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "RUNTIME_ERROR",

                category:
                    "runtime",

            },
        );

    }


    /*
    ======================================================
    Scheduler
    ======================================================
    */

    public static scheduler(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "SCHEDULER_ERROR"
                    | "SCHEDULER_INITIALIZATION_FAILED"
                    | "SCHEDULER_START_FAILED"
                    | "SCHEDULER_STOP_FAILED"
                    | "SCHEDULER_TASK_FAILED"
                    | "SCHEDULER_TASK_NOT_FOUND"
                    | "SCHEDULER_QUEUE_FULL"
                    | "SCHEDULER_QUEUE_FAILED"
                    | "SCHEDULER_PERSISTENCE_FAILED"
                    | "SCHEDULER_RECOVERY_FAILED"
                    | "SCHEDULER_CRON_FAILED"
                    | "SCHEDULER_INTERVAL_FAILED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "SCHEDULER_ERROR",

                category:
                    "scheduler",

            },
        );

    }


    /*
    ======================================================
    Pipeline
    ======================================================
    */

    public static pipeline(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "PIPELINE_ERROR"
                    | "PIPELINE_INVALID"
                    | "PIPELINE_INITIALIZATION_FAILED"
                    | "PIPELINE_STAGE_FAILED"
                    | "PIPELINE_STAGE_NOT_FOUND"
                    | "PIPELINE_EXECUTION_FAILED"
                    | "PIPELINE_TIMEOUT"
                    | "PIPELINE_CANCELLED"
                    | "PIPELINE_CONTEXT_INVALID";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "PIPELINE_ERROR",

                category:
                    "pipeline",

            },
        );

    }


    /*
    ======================================================
    Plugin
    ======================================================
    */

    public static plugin(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "PLUGIN_ERROR"
                    | "PLUGIN_NOT_FOUND"
                    | "PLUGIN_INVALID"
                    | "PLUGIN_MANIFEST_INVALID"
                    | "PLUGIN_LOAD_FAILED"
                    | "PLUGIN_INITIALIZATION_FAILED"
                    | "PLUGIN_START_FAILED"
                    | "PLUGIN_STOP_FAILED"
                    | "PLUGIN_EXECUTION_FAILED"
                    | "PLUGIN_VALIDATION_FAILED"
                    | "PLUGIN_SANDBOX_FAILED"
                    | "PLUGIN_DISABLED"
                    | "PLUGIN_UNSUPPORTED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "PLUGIN_ERROR",

                category:
                    "plugin",

            },
        );

    }


    /*
    ======================================================
    Resource
    ======================================================
    */

    public static resource(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "RESOURCE_ERROR"
                    | "RESOURCE_NOT_FOUND"
                    | "RESOURCE_UNAVAILABLE"
                    | "RESOURCE_EXHAUSTED"
                    | "RESOURCE_LIMIT_EXCEEDED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "RESOURCE_ERROR",

                category:
                    "resource",

            },
        );

    }


    /*
    ======================================================
    Serialization
    ======================================================
    */

    public static serialization(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "SERIALIZATION_ERROR"
                    | "SERIALIZATION_FAILED"
                    | "DESERIALIZATION_FAILED"
                    | "SERIALIZATION_INVALID_DATA"
                    | "SERIALIZATION_UNSUPPORTED_FORMAT"
                    | "SERIALIZATION_COMPRESSION_FAILED"
                    | "SERIALIZATION_ENCRYPTION_FAILED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "SERIALIZATION_ERROR",

                category:
                    "serialization",

            },
        );

    }


    /*
    ======================================================
    Telemetry
    ======================================================
    */

    public static telemetry(
        message: string,
        options:
            Omit<
                ErrorFactoryOptions,
                "code" | "category"
            > & {
                readonly code?:
                    | "TELEMETRY_ERROR"
                    | "TELEMETRY_COLLECTION_FAILED"
                    | "TELEMETRY_BUFFER_FAILED"
                    | "TELEMETRY_STORAGE_FAILED"
                    | "TELEMETRY_EXPORT_FAILED"
                    | "TELEMETRY_UPLOAD_FAILED";
            } = {},
    ): AURAError {

        return this.create(
            message,
            {

                ...options,

                code:
                    options.code ??
                    "TELEMETRY_ERROR",

                category:
                    "telemetry",

            },
        );

    }


    /*
    ======================================================
    Build Context
    ======================================================
    */

    private static buildContext(
        options:
            ErrorFactoryOptions,
        category:
            ErrorCategory,
    ): ErrorContext {

        const base =
            options.context ??
            {};


        const generated =
            createErrorContext({

                category,

                code:
                    options.code,

                timestamp:
                    new Date().toISOString(),

            });


        return mergeErrorContext(
            generated,
            base,
        );

    }


    /*
    ======================================================
    Build Metadata
    ======================================================
    */

    private static buildMetadata(
        current:
            ErrorMetadata | undefined,
        extra:
            ErrorMetadata | undefined,
    ): ErrorMetadata | undefined {

        if (
            !current &&
            !extra
        ) {

            return undefined;

        }


        return {

            ...(current ?? {}),

            ...(extra ?? {}),

        } as ErrorMetadata;

    }


    /*
    ======================================================
    Inspect
    ======================================================
    */

    public static inspect(
        error: AURAError,
    ): ErrorFactoryResult {

        const code =
            error.code;


        const category =
            error.context?.category ??
            ErrorCategoryResolver.fromCode(
                code,
            );


        const metadata =
            code
                ? getErrorCodeMetadata(
                    code,
                )
                : undefined;


        return {

            error,

            code,

            category,

            severity:
                error.severity,

            retryable:
                metadata?.retryable ??
                false,

        };

    }

}


/*
==========================================================
Functional Factory
==========================================================
*/

export function createError(
    message: string,
    options:
        ErrorFactoryOptions = {},
): AURAError {

    return ErrorFactory.create(
        message,
        options,
    );

}


/*
==========================================================
 Unknown Error Factory
==========================================================
*/

export function createErrorFromUnknown(
    error: unknown,
    options:
        ErrorFactoryOptions = {},
): AURAError {

    return ErrorFactory.fromUnknown(
        error,
        options,
    );

}


/*
==========================================================
 Configuration Error
==========================================================
*/

export function createConfigurationError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.configuration
        >[1] = {},
): AURAError {

    return ErrorFactory.configuration(
        message,
        options,
    );

}


/*
==========================================================
 Validation Error
==========================================================
*/

export function createValidationError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.validation
        >[1] = {},
): AURAError {

    return ErrorFactory.validation(
        message,
        options,
    );

}


/*
==========================================================
 Network Error
==========================================================
*/

export function createNetworkError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.network
        >[1] = {},
): AURAError {

    return ErrorFactory.network(
        message,
        options,
    );

}


/*
==========================================================
 Exchange Error
==========================================================
*/

export function createExchangeError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.exchange
        >[1] = {},
): AURAError {

    return ErrorFactory.exchange(
        message,
        options,
    );

}


/*
==========================================================
 Market Error
==========================================================
*/

export function createMarketError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.market
        >[1] = {},
): AURAError {

    return ErrorFactory.market(
        message,
        options,
    );

}


/*
==========================================================
 Order Error
==========================================================
*/

export function createOrderError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.order
        >[1] = {},
): AURAError {

    return ErrorFactory.order(
        message,
        options,
    );

}


/*
==========================================================
 Strategy Error
==========================================================
*/

export function createStrategyError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.strategy
        >[1] = {},
): AURAError {

    return ErrorFactory.strategy(
        message,
        options,
    );

}


/*
==========================================================
 Risk Error
==========================================================
*/

export function createRiskError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.risk
        >[1] = {},
): AURAError {

    return ErrorFactory.risk(
        message,
        options,
    );

}


/*
==========================================================
 Runtime Error
==========================================================
*/

export function createRuntimeError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.runtime
        >[1] = {},
): AURAError {

    return ErrorFactory.runtime(
        message,
        options,
    );

}


/*
==========================================================
 Scheduler Error
==========================================================
*/

export function createSchedulerError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.scheduler
        >[1] = {},
): AURAError {

    return ErrorFactory.scheduler(
        message,
        options,
    );

}


/*
==========================================================
 Pipeline Error
==========================================================
*/

export function createPipelineError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.pipeline
        >[1] = {},
): AURAError {

    return ErrorFactory.pipeline(
        message,
        options,
    );

}


/*
==========================================================
 Plugin Error
==========================================================
*/

export function createPluginError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.plugin
        >[1] = {},
): AURAError {

    return ErrorFactory.plugin(
        message,
        options,
    );

}


/*
==========================================================
 Resource Error
==========================================================
*/

export function createResourceError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.resource
        >[1] = {},
): AURAError {

    return ErrorFactory.resource(
        message,
        options,
    );

}


/*
==========================================================
 Serialization Error
==========================================================
*/

export function createSerializationError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.serialization
        >[1] = {},
): AURAError {

    return ErrorFactory.serialization(
        message,
        options,
    );

}


/*
==========================================================
 Telemetry Error
==========================================================
*/

export function createTelemetryError(
    message: string,
    options:
        Parameters<
            typeof ErrorFactory.telemetry
        >[1] = {},
): AURAError {

    return ErrorFactory.telemetry(
        message,
        options,
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorFactory;
