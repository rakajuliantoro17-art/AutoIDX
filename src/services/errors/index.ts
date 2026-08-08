/**
==========================================================
AURA Trade OS
Errors Service
Version : 0.0.7 Alpha
==========================================================
Central Error Service Barrel
==========================================================
*/


/*
==========================================================
 Core Error
==========================================================
*/

export {
    AURAError,
} from "./error";


/*
==========================================================
 Error Category
==========================================================
*/

export type {
    ErrorCategory,
} from "./errorCategory";


/*
==========================================================
 Error Code
==========================================================
*/

export type {
    ErrorCode,
} from "./errorCode";


/*
==========================================================
 Error Severity
==========================================================
*/

export {
    ErrorSeverity,
} from "./errorSeverity";


/*
==========================================================
 Error Context
==========================================================
*/

export type {
    ErrorContext,
} from "./errorContext";


/*
==========================================================
 Error Metadata
==========================================================
*/

export type {
    ErrorMetadata,
} from "./errorMetadata";


/*
==========================================================
 Configuration Error
==========================================================
*/

export {
    ConfigurationError,
} from "./configurationError";

export type {
    ConfigurationErrorOptions,
    ConfigurationErrorSerialized,
} from "./configurationError";


/*
==========================================================
 Exchange Error
==========================================================
*/

export {
    ExchangeError,
} from "./exchangeError";

export type {
    ExchangeErrorOptions,
    ExchangeErrorSerialized,
} from "./exchangeError";


/*
==========================================================
 Validation Error
==========================================================
*/

export {
    ValidationError,
} from "./validationError";

export type {
    ValidationErrorOptions,
    ValidationErrorSerialized,
} from "./validationError";


/*
==========================================================
 Strategy Error
==========================================================
*/

export {
    StrategyError,
} from "./strategyError";

export type {
    StrategyErrorOptions,
    StrategyErrorSerialized,
} from "./strategyError";


/*
==========================================================
 Runtime Error
==========================================================
*/

export {
    RuntimeError,
} from "./runtimeError";

export type {
    RuntimeErrorOptions,
    RuntimeErrorSerialized,
} from "./runtimeError";


/*
==========================================================
 Risk Error
==========================================================
*/

export {
    RiskError,
} from "./riskError";

export type {
    RiskErrorOptions,
    RiskErrorSerialized,
} from "./riskError";


/*
==========================================================
 Operational Error
==========================================================
*/

export {
    OperationalError,
} from "./operationalError";

export type {
    OperationalErrorOptions,
    OperationalErrorSerialized,
} from "./operationalError";


/*
==========================================================
 Network Error
==========================================================
*/

export {
    NetworkError,
} from "./networkError";

export type {
    NetworkErrorOptions,
    NetworkErrorSerialized,
} from "./networkError";


/*
==========================================================
 Market Error
==========================================================
*/

export {
    MarketError,
    createMarketError,
    normalizeMarketError,
    createSymbolUnavailableError,
    createMarketUnavailableError,
    createMarketDataUnavailableError,
    createStaleMarketDataError,
    createInvalidMarketDataError,
    createIncompleteMarketDataError,
    createMissingCandleError,
    createInvalidOHLCVError,
    createInvalidOrderBookError,
    createInvalidMarketPriceError,
    createInvalidMarketVolumeError,
    createMarketHaltedError,
    createInsufficientLiquidityError,
    isMarketError,
} from "./marketError";

export type {
    MarketErrorOptions,
    MarketErrorSerialized,
} from "./marketError";


/*
==========================================================
 Error Factory
==========================================================
*/

export {
    ErrorFactory,
} from "./errorFactory";


/*
==========================================================
 Error Handler
==========================================================
*/

export {
    ErrorHandler,
} from "./errorHandler";


/*
==========================================================
 Error Manager
==========================================================
*/

export {
    ErrorManager,
} from "./errorManager";


/*
==========================================================
 Error Normalizer
==========================================================
*/

export {
    ErrorNormalizer,
} from "./errorNormalizer";


/*
==========================================================
 Error Registry
==========================================================
*/

export {
    ErrorRegistry,
} from "./errorRegistry";


/*
==========================================================
 Error Serializer
==========================================================
*/

export {
    ErrorSerializer,
} from "./errorSerializer";


/*
==========================================================
 Default Export
==========================================================
*/

