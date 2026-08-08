/**
==========================================================
AURA Trade OS
Error Code
Version : 0.0.7 Alpha
==========================================================
Stable Machine-Readable Error Codes
==========================================================
*/

import type {
    ErrorCategory,
} from "./errorCategory";

import type {
    ErrorSeverity,
} from "./errorSeverity";

 /*
==========================================================
Error Code
==========================================================
*/

export type ErrorCode =

    /*
    ======================================================
    Generic / System
    ======================================================
    */

    | "UNKNOWN_ERROR"
    | "INTERNAL_ERROR"
    | "SYSTEM_ERROR"
    | "OPERATION_FAILED"
    | "NOT_IMPLEMENTED"
    | "SERVICE_UNAVAILABLE"


    /*
    ======================================================
    Configuration
    ======================================================
    */

    | "CONFIGURATION_ERROR"
    | "CONFIGURATION_MISSING"
    | "CONFIGURATION_INVALID"
    | "CONFIGURATION_UNSUPPORTED"
    | "CONFIGURATION_TYPE_INVALID"
    | "CONFIGURATION_VALUE_INVALID"
    | "CONFIGURATION_ENVIRONMENT_INVALID"
    | "CONFIGURATION_RUNTIME_INVALID"


    /*
    ======================================================
    Validation
    ======================================================
    */

    | "VALIDATION_ERROR"
    | "VALIDATION_FAILED"
    | "VALIDATION_SCHEMA_INVALID"
    | "VALIDATION_RULE_INVALID"
    | "VALIDATION_REQUIRED"
    | "VALIDATION_TYPE_MISMATCH"
    | "VALIDATION_FORMAT_INVALID"
    | "VALIDATION_RANGE_INVALID"


    /*
    ======================================================
    Authentication / Authorization
    ======================================================
    */

    | "AUTHENTICATION_ERROR"
    | "AUTHENTICATION_FAILED"
    | "AUTHENTICATION_REQUIRED"
    | "AUTHENTICATION_EXPIRED"
    | "AUTHENTICATION_INVALID"

    | "AUTHORIZATION_ERROR"
    | "AUTHORIZATION_FAILED"
    | "AUTHORIZATION_DENIED"
    | "AUTHORIZATION_FORBIDDEN"


    /*
    ======================================================
    Network
    ======================================================
    */

    | "NETWORK_ERROR"
    | "NETWORK_UNAVAILABLE"
    | "NETWORK_TIMEOUT"
    | "NETWORK_CONNECTION_FAILED"
    | "NETWORK_CONNECTION_RESET"
    | "NETWORK_DNS_FAILED"
    | "NETWORK_PROTOCOL_ERROR"


    /*
    ======================================================
    Storage
    ======================================================
    */

    | "STORAGE_ERROR"
    | "STORAGE_UNAVAILABLE"
    | "STORAGE_READ_FAILED"
    | "STORAGE_WRITE_FAILED"
    | "STORAGE_DELETE_FAILED"
    | "STORAGE_NOT_FOUND"
    | "STORAGE_CORRUPTED"


    /*
    ======================================================
    Serialization
    ======================================================
    */

    | "SERIALIZATION_ERROR"
    | "SERIALIZATION_FAILED"
    | "DESERIALIZATION_FAILED"
    | "SERIALIZATION_INVALID_DATA"
    | "SERIALIZATION_UNSUPPORTED_FORMAT"
    | "SERIALIZATION_COMPRESSION_FAILED"
    | "SERIALIZATION_ENCRYPTION_FAILED"


    /*
    ======================================================
    Telemetry
    ======================================================
    */

    | "TELEMETRY_ERROR"
    | "TELEMETRY_COLLECTION_FAILED"
    | "TELEMETRY_BUFFER_FAILED"
    | "TELEMETRY_STORAGE_FAILED"
    | "TELEMETRY_EXPORT_FAILED"
    | "TELEMETRY_UPLOAD_FAILED"


    /*
    ======================================================
    Exchange
    ======================================================
    */

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
    | "EXCHANGE_MARKET_UNAVAILABLE"


    /*
    ======================================================
    Market
    ======================================================
    */

    | "MARKET_ERROR"
    | "MARKET_DATA_UNAVAILABLE"
    | "MARKET_DATA_INVALID"
    | "MARKET_DATA_STALE"
    | "MARKET_TICKER_UNAVAILABLE"
    | "MARKET_CANDLE_UNAVAILABLE"
    | "MARKET_ORDERBOOK_UNAVAILABLE"
    | "MARKET_SYMBOL_INVALID"
    | "MARKET_PAIR_UNSUPPORTED"
    | "MARKET_INTERVAL_UNSUPPORTED"


    /*
    ======================================================
    Order
    ======================================================
    */

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
    | "ORDER_MARKET_CLOSED"


    /*
    ======================================================
    Portfolio
    ======================================================
    */

    | "PORTFOLIO_ERROR"
    | "PORTFOLIO_UNAVAILABLE"
    | "PORTFOLIO_STATE_INVALID"
    | "PORTFOLIO_BALANCE_INVALID"
    | "PORTFOLIO_POSITION_INVALID"
    | "PORTFOLIO_POSITION_NOT_FOUND"
    | "PORTFOLIO_UPDATE_FAILED"


    /*
    ======================================================
    Strategy
    ======================================================
    */

    | "STRATEGY_ERROR"
    | "STRATEGY_INVALID"
    | "STRATEGY_NOT_FOUND"
    | "STRATEGY_DISABLED"
    | "STRATEGY_CONFIGURATION_INVALID"
    | "STRATEGY_EXECUTION_FAILED"
    | "STRATEGY_SIGNAL_INVALID"
    | "STRATEGY_SIGNAL_UNAVAILABLE"
    | "STRATEGY_INDICATOR_UNAVAILABLE"
    | "STRATEGY_MARKET_DATA_UNAVAILABLE"


    /*
    ======================================================
    Risk
    ======================================================
    */

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
    | "RISK_VOLATILITY_TOO_HIGH"


    /*
    ======================================================
    Runtime
    ======================================================
    */

    | "RUNTIME_ERROR"
    | "RUNTIME_INITIALIZATION_FAILED"
    | "RUNTIME_START_FAILED"
    | "RUNTIME_STOP_FAILED"
    | "RUNTIME_NOT_READY"
    | "RUNTIME_INVALID_STATE"
    | "RUNTIME_RESOURCE_UNAVAILABLE"
    | "RUNTIME_DEPENDENCY_FAILED"
    | "RUNTIME_EXECUTION_FAILED"


    /*
    ======================================================
    Scheduler
    ======================================================
    */

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
    | "SCHEDULER_INTERVAL_FAILED"


    /*
    ======================================================
    Pipeline
    ======================================================
    */

    | "PIPELINE_ERROR"
    | "PIPELINE_INVALID"
    | "PIPELINE_INITIALIZATION_FAILED"
    | "PIPELINE_STAGE_FAILED"
    | "PIPELINE_STAGE_NOT_FOUND"
    | "PIPELINE_EXECUTION_FAILED"
    | "PIPELINE_TIMEOUT"
    | "PIPELINE_CANCELLED"
    | "PIPELINE_CONTEXT_INVALID"


    /*
    ======================================================
    Plugin
    ======================================================
    */

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
    | "PLUGIN_UNSUPPORTED"


    /*
    ======================================================
    Resource
    ======================================================
    */

    | "RESOURCE_ERROR"
    | "RESOURCE_NOT_FOUND"
    | "RESOURCE_UNAVAILABLE"
    | "RESOURCE_EXHAUSTED"
    | "RESOURCE_LIMIT_EXCEEDED";


/*
==========================================================
Error Code Metadata
==========================================================
*/

export interface ErrorCodeMetadata {

    readonly code: ErrorCode;

    readonly category: ErrorCategory;

    readonly description: string;

    readonly retryable: boolean;

    readonly title?: string;

    readonly summary?: string;

    readonly message?: string;

    readonly severity?: ErrorSeverity;

    readonly operational?: boolean;

    readonly reportable?: boolean;

}


/*
==========================================================
Default Metadata
==========================================================
*/

const DEFAULT_METADATA:
    ErrorCodeMetadata = {

    code: "UNKNOWN_ERROR",

    category: "unknown",

    description:
        "Unknown or unclassified error.",

    retryable: false,

};


/*
==========================================================
Error Code Registry
==========================================================
*/

const ERROR_CODE_METADATA:
    Partial<
        Record<
            ErrorCode,
            ErrorCodeMetadata
        >
    > = {};


/*
==========================================================
Register Metadata
==========================================================
*/

function registerCode(
    code: ErrorCode,
    category: string,
    description: string,
    retryable = false,
): void {

    ERROR_CODE_METADATA[code] = {

        code,

        category,

        description,

        retryable,

    };

}


/*
==========================================================
Generic
==========================================================
*/

registerCode(
    "UNKNOWN_ERROR",
    "unknown",
    "Unknown or unclassified error.",
);

registerCode(
    "INTERNAL_ERROR",
    "internal",
    "Unexpected internal application error.",
);

registerCode(
    "SYSTEM_ERROR",
    "system",
    "General system-level error.",
);

registerCode(
    "OPERATION_FAILED",
    "system",
    "Requested operation failed.",
);

registerCode(
    "NOT_IMPLEMENTED",
    "system",
    "Requested operation is not implemented.",
);

registerCode(
    "SERVICE_UNAVAILABLE",
    "system",
    "Required service is unavailable.",
    "true" === "true",
);


/*
==========================================================
Configuration
==========================================================
*/

registerCode(
    "CONFIGURATION_ERROR",
    "configuration",
    "General configuration error.",
);

registerCode(
    "CONFIGURATION_MISSING",
    "configuration",
    "Required configuration is missing.",
);

registerCode(
    "CONFIGURATION_INVALID",
    "configuration",
    "Configuration is invalid.",
);

registerCode(
    "CONFIGURATION_UNSUPPORTED",
    "configuration",
    "Configuration value is unsupported.",
);

registerCode(
    "CONFIGURATION_TYPE_INVALID",
    "configuration",
    "Configuration has an invalid type.",
);

registerCode(
    "CONFIGURATION_VALUE_INVALID",
    "configuration",
    "Configuration has an invalid value.",
);

registerCode(
    "CONFIGURATION_ENVIRONMENT_INVALID",
    "configuration",
    "Environment configuration is invalid.",
);

registerCode(
    "CONFIGURATION_RUNTIME_INVALID",
    "configuration",
    "Runtime configuration is invalid.",
);


/*
==========================================================
Validation
==========================================================
*/

registerCode(
    "VALIDATION_ERROR",
    "validation",
    "General validation error.",
);

registerCode(
    "VALIDATION_FAILED",
    "validation",
    "Validation failed.",
);

registerCode(
    "VALIDATION_SCHEMA_INVALID",
    "validation",
    "Validation schema is invalid.",
);

registerCode(
    "VALIDATION_RULE_INVALID",
    "validation",
    "Validation rule is invalid.",
);

registerCode(
    "VALIDATION_REQUIRED",
    "validation",
    "Required value is missing.",
);

registerCode(
    "VALIDATION_TYPE_MISMATCH",
    "validation",
    "Value type does not match the expected type.",
);

registerCode(
    "VALIDATION_FORMAT_INVALID",
    "validation",
    "Value format is invalid.",
);

registerCode(
    "VALIDATION_RANGE_INVALID",
    "validation",
    "Value is outside the allowed range.",
);


/*
==========================================================
Network
==========================================================
*/

registerCode(
    "NETWORK_ERROR",
    "network",
    "General network error.",
    true,
);

registerCode(
    "NETWORK_UNAVAILABLE",
    "network",
    "Network is unavailable.",
    true,
);

registerCode(
    "NETWORK_TIMEOUT",
    "network",
    "Network request timed out.",
    true,
);

registerCode(
    "NETWORK_CONNECTION_FAILED",
    "network",
    "Network connection failed.",
    true,
);

registerCode(
    "NETWORK_CONNECTION_RESET",
    "network",
    "Network connection was reset.",
    true,
);

registerCode(
    "NETWORK_DNS_FAILED",
    "network",
    "DNS resolution failed.",
    true,
);

registerCode(
    "NETWORK_PROTOCOL_ERROR",
    "network",
    "Network protocol error occurred.",
);


/*
==========================================================
Exchange
==========================================================
*/

registerCode(
    "EXCHANGE_ERROR",
    "exchange",
    "General exchange error.",
    true,
);

registerCode(
    "EXCHANGE_UNAVAILABLE",
    "exchange",
    "Exchange service is unavailable.",
    true,
);

registerCode(
    "EXCHANGE_AUTHENTICATION_FAILED",
    "exchange",
    "Exchange authentication failed.",
);

registerCode(
    "EXCHANGE_AUTHORIZATION_FAILED",
    "exchange",
    "Exchange authorization failed.",
);

registerCode(
    "EXCHANGE_REQUEST_FAILED",
    "exchange",
    "Exchange request failed.",
    true,
);

registerCode(
    "EXCHANGE_RESPONSE_INVALID",
    "exchange",
    "Exchange returned an invalid response.",
);

registerCode(
    "EXCHANGE_RATE_LIMIT",
    "exchange",
    "Exchange rate limit was exceeded.",
    true,
);

registerCode(
    "EXCHANGE_TIMEOUT",
    "exchange",
    "Exchange request timed out.",
    true,
);

registerCode(
    "EXCHANGE_CONNECTION_FAILED",
    "exchange",
    "Connection to exchange failed.",
    true,
);

registerCode(
    "EXCHANGE_BALANCE_UNAVAILABLE",
    "exchange",
    "Exchange balance is unavailable.",
    true,
);

registerCode(
    "EXCHANGE_ORDER_FAILED",
    "exchange",
    "Exchange order request failed.",
    true,
);

registerCode(
    "EXCHANGE_ORDER_REJECTED",
    "exchange",
    "Exchange rejected the order.",
);

registerCode(
    "EXCHANGE_ORDER_NOT_FOUND",
    "exchange",
    "Exchange order was not found.",
);

registerCode(
    "EXCHANGE_ORDER_CANCEL_FAILED",
    "exchange",
    "Exchange order cancellation failed.",
    true,
);

registerCode(
    "EXCHANGE_MARKET_UNAVAILABLE",
    "exchange",
    "Exchange market is unavailable.",
    true,
);


/*
==========================================================
Market
==========================================================
*/

registerCode(
    "MARKET_ERROR",
    "market",
    "General market data error.",
    true,
);

registerCode(
    "MARKET_DATA_UNAVAILABLE",
    "market",
    "Market data is unavailable.",
    true,
);

registerCode(
    "MARKET_DATA_INVALID",
    "market",
    "Market data is invalid.",
);

registerCode(
    "MARKET_DATA_STALE",
    "market",
    "Market data is stale.",
    true,
);

registerCode(
    "MARKET_TICKER_UNAVAILABLE",
    "market",
    "Market ticker is unavailable.",
    true,
);

registerCode(
    "MARKET_CANDLE_UNAVAILABLE",
    "market",
    "Market candle data is unavailable.",
    true,
);

registerCode(
    "MARKET_ORDERBOOK_UNAVAILABLE",
    "market",
    "Market order book is unavailable.",
    true,
);

registerCode(
    "MARKET_SYMBOL_INVALID",
    "market",
    "Market symbol is invalid.",
);

registerCode(
    "MARKET_PAIR_UNSUPPORTED",
    "market",
    "Market pair is unsupported.",
);

registerCode(
    "MARKET_INTERVAL_UNSUPPORTED",
    "market",
    "Market interval is unsupported.",
);


/*
==========================================================
Order
==========================================================
*/

registerCode(
    "ORDER_ERROR",
    "order",
    "General order error.",
);

registerCode(
    "ORDER_INVALID",
    "order",
    "Order is invalid.",
);

registerCode(
    "ORDER_NOT_FOUND",
    "order",
    "Order was not found.",
);

registerCode(
    "ORDER_REJECTED",
    "order",
    "Order was rejected.",
);

registerCode(
    "ORDER_CANCEL_FAILED",
    "order",
    "Order cancellation failed.",
    true,
);

registerCode(
    "ORDER_SUBMIT_FAILED",
    "order",
    "Order submission failed.",
    true,
);

registerCode(
    "ORDER_SIZE_INVALID",
    "order",
    "Order size is invalid.",
);

registerCode(
    "ORDER_PRICE_INVALID",
    "order",
    "Order price is invalid.",
);

registerCode(
    "ORDER_SIDE_INVALID",
    "order",
    "Order side is invalid.",
);

registerCode(
    "ORDER_TYPE_INVALID",
    "order",
    "Order type is invalid.",
);

registerCode(
    "ORDER_BALANCE_INSUFFICIENT",
    "order",
    "Insufficient balance for order.",
);

registerCode(
    "ORDER_MARKET_CLOSED",
    "order",
    "Market is currently unavailable for order execution.",
);


/*
==========================================================
Portfolio
==========================================================
*/

registerCode(
    "PORTFOLIO_ERROR",
    "portfolio",
    "General portfolio error.",
);

registerCode(
    "PORTFOLIO_UNAVAILABLE",
    "portfolio",
    "Portfolio state is unavailable.",
    true,
);

registerCode(
    "PORTFOLIO_STATE_INVALID",
    "portfolio",
    "Portfolio state is invalid.",
);

registerCode(
    "PORTFOLIO_BALANCE_INVALID",
    "portfolio",
    "Portfolio balance is invalid.",
);

registerCode(
    "PORTFOLIO_POSITION_INVALID",
    "portfolio",
    "Portfolio position is invalid.",
);

registerCode(
    "PORTFOLIO_POSITION_NOT_FOUND",
    "portfolio",
    "Portfolio position was not found.",
);

registerCode(
    "PORTFOLIO_UPDATE_FAILED",
    "portfolio",
    "Portfolio update failed.",
    true,
);


/*
==========================================================
Strategy
==========================================================
*/

registerCode(
    "STRATEGY_ERROR",
    "strategy",
    "General strategy error.",
);

registerCode(
    "STRATEGY_INVALID",
    "strategy",
    "Strategy definition is invalid.",
);

registerCode(
    "STRATEGY_NOT_FOUND",
    "strategy",
    "Strategy was not found.",
);

registerCode(
    "STRATEGY_DISABLED",
    "strategy",
    "Strategy is disabled.",
);

registerCode(
    "STRATEGY_CONFIGURATION_INVALID",
    "strategy",
    "Strategy configuration is invalid.",
);

registerCode(
    "STRATEGY_EXECUTION_FAILED",
    "strategy",
    "Strategy execution failed.",
);

registerCode(
    "STRATEGY_SIGNAL_INVALID",
    "strategy",
    "Strategy generated an invalid signal.",
);

registerCode(
    "STRATEGY_SIGNAL_UNAVAILABLE",
    "strategy",
    "Strategy signal is unavailable.",
    true,
);

registerCode(
    "STRATEGY_INDICATOR_UNAVAILABLE",
    "strategy",
    "Required strategy indicator is unavailable.",
    true,
);

registerCode(
    "STRATEGY_MARKET_DATA_UNAVAILABLE",
    "strategy",
    "Required market data is unavailable.",
    true,
);


/*
==========================================================
Risk
==========================================================
*/

registerCode(
    "RISK_ERROR",
    "risk",
    "General risk engine error.",
);

registerCode(
    "RISK_LIMIT_EXCEEDED",
    "risk",
    "Configured risk limit has been exceeded.",
);

registerCode(
    "RISK_CONFIGURATION_INVALID",
    "risk",
    "Risk configuration is invalid.",
);

registerCode(
    "RISK_EVALUATION_FAILED",
    "risk",
    "Risk evaluation failed.",
);

registerCode(
    "RISK_CHECK_FAILED",
    "risk",
    "Risk check failed.",
);

registerCode(
    "RISK_POSITION_LIMIT",
    "risk",
    "Position risk limit exceeded.",
);

registerCode(
    "RISK_EXPOSURE_LIMIT",
    "risk",
    "Exposure risk limit exceeded.",
);

registerCode(
    "RISK_DRAWDOWN_LIMIT",
    "risk",
    "Drawdown risk limit exceeded.",
);

registerCode(
    "RISK_DAILY_LOSS_LIMIT",
    "risk",
    "Daily loss limit exceeded.",
);

registerCode(
    "RISK_TRADE_SIZE_LIMIT",
    "risk",
    "Trade size limit exceeded.",
);

registerCode(
    "RISK_VOLATILITY_TOO_HIGH",
    "risk",
    "Market volatility is too high for the configured risk profile.",
);


/*
==========================================================
Runtime
==========================================================
*/

registerCode(
    "RUNTIME_ERROR",
    "runtime",
    "General runtime error.",
);

registerCode(
    "RUNTIME_INITIALIZATION_FAILED",
    "runtime",
    "Runtime initialization failed.",
);

registerCode(
    "RUNTIME_START_FAILED",
    "runtime",
    "Runtime startup failed.",
);

registerCode(
    "RUNTIME_STOP_FAILED",
    "runtime",
    "Runtime shutdown failed.",
);

registerCode(
    "RUNTIME_NOT_READY",
    "runtime",
    "Runtime is not ready.",
);

registerCode(
    "RUNTIME_INVALID_STATE",
    "runtime",
    "Runtime is in an invalid state.",
);

registerCode(
    "RUNTIME_RESOURCE_UNAVAILABLE",
    "runtime",
    "Required runtime resource is unavailable.",
    true,
);

registerCode(
    "RUNTIME_DEPENDENCY_FAILED",
    "runtime",
    "Runtime dependency failed.",
    true,
);

registerCode(
    "RUNTIME_EXECUTION_FAILED",
    "runtime",
    "Runtime execution failed.",
);


/*
==========================================================
Scheduler
==========================================================
*/

registerCode(
    "SCHEDULER_ERROR",
    "scheduler",
    "General scheduler error.",
);

registerCode(
    "SCHEDULER_INITIALIZATION_FAILED",
    "scheduler",
    "Scheduler initialization failed.",
);

registerCode(
    "SCHEDULER_START_FAILED",
    "scheduler",
    "Scheduler startup failed.",
);

registerCode(
    "SCHEDULER_STOP_FAILED",
    "scheduler",
    "Scheduler shutdown failed.",
);

registerCode(
    "SCHEDULER_TASK_FAILED",
    "scheduler",
    "Scheduled task failed.",
);

registerCode(
    "SCHEDULER_TASK_NOT_FOUND",
    "scheduler",
    "Scheduled task was not found.",
);

registerCode(
    "SCHEDULER_QUEUE_FULL",
    "scheduler",
    "Scheduler queue is full.",
    true,
);

registerCode(
    "SCHEDULER_QUEUE_FAILED",
    "scheduler",
    "Scheduler queue operation failed.",
    true,
);

registerCode(
    "SCHEDULER_PERSISTENCE_FAILED",
    "scheduler",
    "Scheduler persistence operation failed.",
    true,
);

registerCode(
    "SCHEDULER_RECOVERY_FAILED",
    "scheduler",
    "Scheduler recovery failed.",
    true,
);

registerCode(
    "SCHEDULER_CRON_FAILED",
    "scheduler",
    "Cron scheduler execution failed.",
    true,
);

registerCode(
    "SCHEDULER_INTERVAL_FAILED",
    "scheduler",
    "Interval scheduler execution failed.",
    true,
);


/*
==========================================================
Pipeline
==========================================================
*/

registerCode(
    "PIPELINE_ERROR",
    "pipeline",
    "General pipeline error.",
);

registerCode(
    "PIPELINE_INVALID",
    "pipeline",
    "Pipeline definition is invalid.",
);

registerCode(
    "PIPELINE_INITIALIZATION_FAILED",
    "pipeline",
    "Pipeline initialization failed.",
);

registerCode(
    "PIPELINE_STAGE_FAILED",
    "pipeline",
    "Pipeline stage failed.",
);

registerCode(
    "PIPELINE_STAGE_NOT_FOUND",
    "pipeline",
    "Pipeline stage was not found.",
);

registerCode(
    "PIPELINE_EXECUTION_FAILED",
    "pipeline",
    "Pipeline execution failed.",
);

registerCode(
    "PIPELINE_TIMEOUT",
    "pipeline",
    "Pipeline execution timed out.",
    true,
);

registerCode(
    "PIPELINE_CANCELLED",
    "pipeline",
    "Pipeline execution was cancelled.",
);

registerCode(
    "PIPELINE_CONTEXT_INVALID",
    "pipeline",
    "Pipeline execution context is invalid.",
);


/*
==========================================================
Plugin
==========================================================
*/

registerCode(
    "PLUGIN_ERROR",
    "plugin",
    "General plugin error.",
);

registerCode(
    "PLUGIN_NOT_FOUND",
    "plugin",
    "Plugin was not found.",
);

registerCode(
    "PLUGIN_INVALID",
    "plugin",
    "Plugin definition is invalid.",
);

registerCode(
    "PLUGIN_MANIFEST_INVALID",
    "plugin",
    "Plugin manifest is invalid.",
);

registerCode(
    "PLUGIN_LOAD_FAILED",
    "plugin",
    "Plugin loading failed.",
);

registerCode(
    "PLUGIN_INITIALIZATION_FAILED",
    "plugin",
    "Plugin initialization failed.",
);

registerCode(
    "PLUGIN_START_FAILED",
    "plugin",
    "Plugin startup failed.",
);

registerCode(
    "PLUGIN_STOP_FAILED",
    "plugin",
    "Plugin shutdown failed.",
);

registerCode(
    "PLUGIN_EXECUTION_FAILED",
    "plugin",
    "Plugin execution failed.",
);

registerCode(
    "PLUGIN_VALIDATION_FAILED",
    "plugin",
    "Plugin validation failed.",
);

registerCode(
    "PLUGIN_SANDBOX_FAILED",
    "plugin",
    "Plugin sandbox execution failed.",
);

registerCode(
    "PLUGIN_DISABLED",
    "plugin",
    "Plugin is disabled.",
);

registerCode(
    "PLUGIN_UNSUPPORTED",
    "plugin",
    "Plugin is unsupported by the current runtime.",
);


/*
==========================================================
Resource
==========================================================
*/

registerCode(
    "RESOURCE_ERROR",
    "resource",
    "General resource error.",
);

registerCode(
    "RESOURCE_NOT_FOUND",
    "resource",
    "Required resource was not found.",
);

registerCode(
    "RESOURCE_UNAVAILABLE",
    "resource",
    "Required resource is unavailable.",
    true,
);

registerCode(
    "RESOURCE_EXHAUSTED",
    "resource",
    "Required resource has been exhausted.",
    true,
);

registerCode(
    "RESOURCE_LIMIT_EXCEEDED",
    "resource",
    "Resource limit has been exceeded.",
);


/*
==========================================================
Serialization
==========================================================
*/

registerCode(
    "SERIALIZATION_ERROR",
    "serialization",
    "General serialization error.",
);

registerCode(
    "SERIALIZATION_FAILED",
    "serialization",
    "Serialization failed.",
);

registerCode(
    "DESERIALIZATION_FAILED",
    "serialization",
    "Deserialization failed.",
);

registerCode(
    "SERIALIZATION_INVALID_DATA",
    "serialization",
    "Data cannot be serialized or deserialized.",
);

registerCode(
    "SERIALIZATION_UNSUPPORTED_FORMAT",
    "serialization",
    "Serialization format is unsupported.",
);

registerCode(
    "SERIALIZATION_COMPRESSION_FAILED",
    "serialization",
    "Compression operation failed.",
);

registerCode(
    "SERIALIZATION_ENCRYPTION_FAILED",
    "serialization",
    "Encryption operation failed.",
);


/*
==========================================================
Telemetry
==========================================================
*/

registerCode(
    "TELEMETRY_ERROR",
    "telemetry",
    "General telemetry error.",
    true,
);

registerCode(
    "TELEMETRY_COLLECTION_FAILED",
    "telemetry",
    "Telemetry collection failed.",
    true,
);

registerCode(
    "TELEMETRY_BUFFER_FAILED",
    "telemetry",
    "Telemetry buffering failed.",
    true,
);

registerCode(
    "TELEMETRY_STORAGE_FAILED",
    "telemetry",
    "Telemetry storage failed.",
    true,
);

registerCode(
    "TELEMETRY_EXPORT_FAILED",
    "telemetry",
    "Telemetry export failed.",
    true,
);

registerCode(
    "TELEMETRY_UPLOAD_FAILED",
    "telemetry",
    "Telemetry upload failed.",
    true,
);


/*
==========================================================
Metadata Resolver
==========================================================
*/

export function getErrorCodeMetadata(
    code: ErrorCode,
): ErrorCodeMetadata {

    return (
        ERROR_CODE_METADATA[code] ??
        {
            ...DEFAULT_METADATA,

            code,

        }
    );

}


/*
==========================================================
Category Resolver
==========================================================
*/

export function getErrorCodeCategory(
    code: ErrorCode,
): string {

    return getErrorCodeMetadata(
        code,
    ).category;

}


/*
==========================================================
Retryability
==========================================================
*/

export function isErrorRetryable(
    code: ErrorCode,
): boolean {

    return getErrorCodeMetadata(
        code,
    ).retryable;

}


/*
==========================================================
Known Code Check
==========================================================
*/

export function isErrorCode(
    value: unknown,
): value is ErrorCode {

    if (
        typeof value !== "string"
    ) {

        return false;

    }


    return (
        value in ERROR_CODE_METADATA
    );

}


/*
==========================================================
Error Code List
==========================================================
*/

export const ERROR_CODES:
    readonly ErrorCode[] =
        Object.freeze(
            Object.keys(
                ERROR_CODE_METADATA,
            ) as ErrorCode[],
        );


/*
==========================================================
Error Code Constants
==========================================================
*/

export const ERROR_CODE =
    Object.freeze({

        /*
        ==============================================
        Generic
        ==============================================
        */

        UNKNOWN:
            "UNKNOWN_ERROR" as ErrorCode,

        INTERNAL:
            "INTERNAL_ERROR" as ErrorCode,

        SYSTEM:
            "SYSTEM_ERROR" as ErrorCode,

        OPERATION_FAILED:
            "OPERATION_FAILED" as ErrorCode,

        NOT_IMPLEMENTED:
            "NOT_IMPLEMENTED" as ErrorCode,

        SERVICE_UNAVAILABLE:
            "SERVICE_UNAVAILABLE" as ErrorCode,


        /*
        ==============================================
        Configuration
        ==============================================
        */

        CONFIGURATION:
            "CONFIGURATION_ERROR" as ErrorCode,

        CONFIGURATION_MISSING:
            "CONFIGURATION_MISSING" as ErrorCode,

        CONFIGURATION_INVALID:
            "CONFIGURATION_INVALID" as ErrorCode,

        CONFIGURATION_UNSUPPORTED:
            "CONFIGURATION_UNSUPPORTED" as ErrorCode,


        /*
        ==============================================
        Validation
        ==============================================
        */

        VALIDATION:
            "VALIDATION_ERROR" as ErrorCode,

        VALIDATION_FAILED:
            "VALIDATION_FAILED" as ErrorCode,

        VALIDATION_SCHEMA_INVALID:
            "VALIDATION_SCHEMA_INVALID" as ErrorCode,

        VALIDATION_RULE_INVALID:
            "VALIDATION_RULE_INVALID" as ErrorCode,


        /*
        ==============================================
        Network
        ==============================================
        */

        NETWORK:
            "NETWORK_ERROR" as ErrorCode,

        NETWORK_UNAVAILABLE:
            "NETWORK_UNAVAILABLE" as ErrorCode,

        NETWORK_TIMEOUT:
            "NETWORK_TIMEOUT" as ErrorCode,

        NETWORK_CONNECTION_FAILED:
            "NETWORK_CONNECTION_FAILED" as ErrorCode,


        /*
        ==============================================
        Exchange
        ==============================================
        */

        EXCHANGE:
            "EXCHANGE_ERROR" as ErrorCode,

        EXCHANGE_UNAVAILABLE:
            "EXCHANGE_UNAVAILABLE" as ErrorCode,

        EXCHANGE_AUTHENTICATION_FAILED:
            "EXCHANGE_AUTHENTICATION_FAILED" as ErrorCode,

        EXCHANGE_RATE_LIMIT:
            "EXCHANGE_RATE_LIMIT" as ErrorCode,

        EXCHANGE_TIMEOUT:
            "EXCHANGE_TIMEOUT" as ErrorCode,

        EXCHANGE_ORDER_FAILED:
            "EXCHANGE_ORDER_FAILED" as ErrorCode,

        EXCHANGE_ORDER_REJECTED:
            "EXCHANGE_ORDER_REJECTED" as ErrorCode,


        /*
        ==============================================
        Market
        ==============================================
        */

        MARKET:
            "MARKET_ERROR" as ErrorCode,

        MARKET_DATA_UNAVAILABLE:
            "MARKET_DATA_UNAVAILABLE" as ErrorCode,

        MARKET_DATA_INVALID:
            "MARKET_DATA_INVALID" as ErrorCode,

        MARKET_DATA_STALE:
            "MARKET_DATA_STALE" as ErrorCode,

        MARKET_PAIR_UNSUPPORTED:
            "MARKET_PAIR_UNSUPPORTED" as ErrorCode,


        /*
        ==============================================
        Order
        ==============================================
        */

        ORDER:
            "ORDER_ERROR" as ErrorCode,

        ORDER_INVALID:
            "ORDER_INVALID" as ErrorCode,

        ORDER_REJECTED:
            "ORDER_REJECTED" as ErrorCode,

        ORDER_BALANCE_INSUFFICIENT:
            "ORDER_BALANCE_INSUFFICIENT" as ErrorCode,


        /*
        ==============================================
        Strategy
        ==============================================
        */

        STRATEGY:
            "STRATEGY_ERROR" as ErrorCode,

        STRATEGY_INVALID:
            "STRATEGY_INVALID" as ErrorCode,

        STRATEGY_EXECUTION_FAILED:
            "STRATEGY_EXECUTION_FAILED" as ErrorCode,

        STRATEGY_SIGNAL_INVALID:
            "STRATEGY_SIGNAL_INVALID" as ErrorCode,


        /*
        ==============================================
        Risk
        ==============================================
        */

        RISK:
            "RISK_ERROR" as ErrorCode,

        RISK_LIMIT_EXCEEDED:
            "RISK_LIMIT_EXCEEDED" as ErrorCode,

        RISK_EVALUATION_FAILED:
            "RISK_EVALUATION_FAILED" as ErrorCode,

        RISK_TRADE_SIZE_LIMIT:
            "RISK_TRADE_SIZE_LIMIT" as ErrorCode,


        /*
        ==============================================
        Runtime
        ==============================================
        */

        RUNTIME:
            "RUNTIME_ERROR" as ErrorCode,

        RUNTIME_NOT_READY:
            "RUNTIME_NOT_READY" as ErrorCode,

        RUNTIME_INVALID_STATE:
            "RUNTIME_INVALID_STATE" as ErrorCode,

        RUNTIME_EXECUTION_FAILED:
            "RUNTIME_EXECUTION_FAILED" as ErrorCode,


        /*
        ==============================================
        Scheduler
        ==============================================
        */

        SCHEDULER:
            "SCHEDULER_ERROR" as ErrorCode,

        SCHEDULER_TASK_FAILED:
            "SCHEDULER_TASK_FAILED" as ErrorCode,

        SCHEDULER_QUEUE_FULL:
            "SCHEDULER_QUEUE_FULL" as ErrorCode,

        SCHEDULER_RECOVERY_FAILED:
            "SCHEDULER_RECOVERY_FAILED" as ErrorCode,


        /*
        ==============================================
        Pipeline
        ==============================================
        */

        PIPELINE:
            "PIPELINE_ERROR" as ErrorCode,

        PIPELINE_STAGE_FAILED:
            "PIPELINE_STAGE_FAILED" as ErrorCode,

        PIPELINE_EXECUTION_FAILED:
            "PIPELINE_EXECUTION_FAILED" as ErrorCode,

        PIPELINE_TIMEOUT:
            "PIPELINE_TIMEOUT" as ErrorCode,


        /*
        ==============================================
        Plugin
        ==============================================
        */

        PLUGIN:
            "PLUGIN_ERROR" as ErrorCode,

        PLUGIN_NOT_FOUND:
            "PLUGIN_NOT_FOUND" as ErrorCode,

        PLUGIN_INVALID:
            "PLUGIN_INVALID" as ErrorCode,

        PLUGIN_LOAD_FAILED:
            "PLUGIN_LOAD_FAILED" as ErrorCode,

        PLUGIN_EXECUTION_FAILED:
            "PLUGIN_EXECUTION_FAILED" as ErrorCode,


        /*
        ==============================================
        Resource
        ==============================================
        */

        RESOURCE:
            "RESOURCE_ERROR" as ErrorCode,

        RESOURCE_NOT_FOUND:
            "RESOURCE_NOT_FOUND" as ErrorCode,

        RESOURCE_UNAVAILABLE:
            "RESOURCE_UNAVAILABLE" as ErrorCode,

        RESOURCE_EXHAUSTED:
            "RESOURCE_EXHAUSTED" as ErrorCode,

    } as const);
