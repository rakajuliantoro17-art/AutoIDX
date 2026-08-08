/**
==========================================================
AURA Trade OS
Strategy Error
Version : 0.0.7 Alpha
==========================================================
Strategy-specific Error Model
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
 Strategy Error Options
==========================================================
*/

export interface StrategyErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Strategy identifier.
     */
    readonly strategy?:
        string;

    /**
     * Strategy version.
     */
    readonly strategyVersion?:
        string;

    /**
     * Trading pair.
     */
    readonly pair?:
        string;

    /**
     * Timeframe.
     *
     * Example:
     * 1m
     * 5m
     * 1h
     */
    readonly timeframe?:
        string;

    /**
     * Strategy operation.
     *
     * Example:
     * analyze
     * signal
     * execute
     */
    readonly operation?:
        string;

    /**
     * Indicator involved in the failure.
     */
    readonly indicator?:
        string;

    /**
     * Signal involved in the failure.
     */
    readonly signal?:
        string;

    /**
     * Expected strategy state.
     */
    readonly expected?:
        unknown;

    /**
     * Actual strategy state.
     */
    readonly received?:
        unknown;

    /**
     * Strategy parameters.
     */
    readonly parameters?:
        Record<
            string,
            unknown
        >;

    /**
     * Whether this strategy error can be retried.
     */
    readonly retryable?:
        boolean;

    /**
     * Whether the strategy is disabled.
     */
    readonly strategyDisabled?:
        boolean;

    /**
     * Whether an indicator is missing.
     */
    readonly indicatorMissing?:
        boolean;

    /**
     * Whether signal generation failed.
     */
    readonly signalFailure?:
        boolean;

    /**
     * Whether strategy execution failed.
     */
    readonly executionFailure?:
        boolean;

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
 Strategy Error
==========================================================
*/

export class StrategyError
    extends AURAError {

    /*
    ======================================================
    Strategy
    ======================================================
    */

    public readonly strategy:
        string | undefined;


    /*
    ======================================================
    Strategy Version
    ======================================================
    */

    public readonly strategyVersion:
        string | undefined;


    /*
    ======================================================
    Pair
    ======================================================
    */

    public readonly pair:
        string | undefined;


    /*
    ======================================================
    Timeframe
    ======================================================
    */

    public readonly timeframe:
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
    Indicator
    ======================================================
    */

    public readonly indicator:
        string | undefined;


    /*
    ======================================================
    Signal
    ======================================================
    */

    public readonly signal:
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
    Parameters
    ======================================================
    */

    public readonly parameters:
        Record<
            string,
            unknown
        > | undefined;


    /*
    ======================================================
    Retryable
    ======================================================
    */

    public readonly retryable:
        boolean;


    /*
    ======================================================
    Strategy Disabled
    ======================================================
    */

    public readonly strategyDisabled:
        boolean;


    /*
    ======================================================
    Indicator Missing
    ======================================================
    */

    public readonly indicatorMissing:
        boolean;


    /*
    ======================================================
    Signal Failure
    ======================================================
    */

    public readonly signalFailure:
        boolean;


    /*
    ======================================================
    Execution Failure
    ======================================================
    */

    public readonly executionFailure:
        boolean;


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
            StrategyErrorOptions = {},
    ) {

        const severity =
            StrategyError.resolveSeverity(
                options,
            );


        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                "strategy",

            service:
                options.context?.service ??
                "strategy-service",

            strategy:
                options.strategy ??
                options.context?.strategy,

            pair:
                options.pair ??
                options.context?.pair,

            timeframe:
                options.timeframe ??
                options.context?.timeframe,

            operation:
                options.operation ??
                options.context?.operation,

            indicator:
                options.indicator ??
                options.context?.indicator,

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

            strategy:
                options.strategy ??
                options.metadata?.strategy,

            strategyVersion:
                options.strategyVersion ??
                options.metadata?.strategyVersion,

            pair:
                options.pair ??
                options.metadata?.pair,

            timeframe:
                options.timeframe ??
                options.metadata?.timeframe,

            operation:
                options.operation ??
                options.metadata?.operation,

            indicator:
                options.indicator ??
                options.metadata?.indicator,

            signal:
                options.signal ??
                options.metadata?.signal,

            retryable:
                options.retryable ??
                options.metadata?.retryable,

            strategyDisabled:
                options.strategyDisabled ??
                options.metadata?.strategyDisabled,

            indicatorMissing:
                options.indicatorMissing ??
                options.metadata?.indicatorMissing,

            signalFailure:
                options.signalFailure ??
                options.metadata?.signalFailure,

            executionFailure:
                options.executionFailure ??
                options.metadata?.executionFailure,

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
            "StrategyError";


        this.strategy =
            options.strategy;


        this.strategyVersion =
            options.strategyVersion;


        this.pair =
            options.pair;


        this.timeframe =
            options.timeframe;


        this.operation =
            options.operation;


        this.indicator =
            options.indicator;


        this.signal =
            options.signal;


        this.expected =
            options.expected;


        this.received =
            options.received;


        this.parameters =
            options.parameters;


        this.retryable =
            options.retryable ??
            StrategyError.defaultRetryable(
                options,
            );


        this.strategyDisabled =
            options.strategyDisabled ??
            false;


        this.indicatorMissing =
            options.indicatorMissing ??
            false;


        this.signalFailure =
            options.signalFailure ??
            false;


        this.executionFailure =
            options.executionFailure ??
            false;


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
            StrategyErrorOptions,
    ):
        ErrorSeverity {

        if (
            options.executionFailure
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.strategyDisabled
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.signalFailure
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.indicatorMissing
        ) {

            return ErrorSeverity.ERROR;

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
            StrategyErrorOptions,
    ):
        boolean {

        if (
            options.strategyDisabled
        ) {

            return false;

        }


        if (
            options.indicatorMissing
        ) {

            return false;

        }


        if (
            options.signalFailure
        ) {

            return true;

        }


        if (
            options.executionFailure
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
    Is Strategy Disabled
    ======================================================
    */

    public isStrategyDisabled():
        boolean {

        return this.strategyDisabled;

    }


    /*
    ======================================================
    Is Indicator Missing
    ======================================================
    */

    public isIndicatorMissing():
        boolean {

        return this.indicatorMissing;

    }


    /*
    ======================================================
    Is Signal Failure
    ======================================================
    */

    public isSignalFailure():
        boolean {

        return this.signalFailure;

    }


    /*
    ======================================================
    Is Execution Failure
    ======================================================
    */

    public isExecutionFailure():
        boolean {

        return this.executionFailure;

    }


    /*
    ======================================================
    Get Strategy
    ======================================================
    */

    public getStrategy():
        string | undefined {

        return this.strategy;

    }


    /*
    ======================================================
    Get Strategy Version
    ======================================================
    */

    public getStrategyVersion():
        string | undefined {

        return this.strategyVersion;

    }


    /*
    ======================================================
    Get Pair
    ======================================================
    */

    public getPair():
        string | undefined {

        return this.pair;

    }


    /*
    ======================================================
    Get Timeframe
    ======================================================
    */

    public getTimeframe():
        string | undefined {

        return this.timeframe;

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
    Get Indicator
    ======================================================
    */

    public getIndicator():
        string | undefined {

        return this.indicator;

    }


    /*
    ======================================================
    Get Signal
    ======================================================
    */

    public getSignal():
        string | undefined {

        return this.signal;

    }


    /*
    ======================================================
    Get Parameters
    ======================================================
    */

    public getParameters():
        Record<
            string,
            unknown
        > | undefined {

        return this.parameters;

    }


    /*
    ======================================================
    To Strategy Object
    ======================================================
    */

    public toStrategyObject():
        StrategyErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            strategy:
                this.strategy,

            strategyVersion:
                this.strategyVersion,

            pair:
                this.pair,

            timeframe:
                this.timeframe,

            operation:
                this.operation,

            indicator:
                this.indicator,

            signal:
                this.signal,

            expected:
                this.expected,

            received:
                this.received,

            retryable:
                this.retryable,

            strategyDisabled:
                this.strategyDisabled,

            indicatorMissing:
                this.indicatorMissing,

            signalFailure:
                this.signalFailure,

            executionFailure:
                this.executionFailure,

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
            StrategyErrorOptions = {},
    ):
        StrategyError {

        if (
            error instanceof
            StrategyError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            return new StrategyError(
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

            return new StrategyError(
                error,
                options,
            );

        }


        return new StrategyError(
            "Unknown strategy error.",
            options,
        );

    }


    /*
    ======================================================
    Invalid Strategy
    ======================================================
    */

    public static invalidStrategy(
        strategy:
            string,
        message:
            string =
                "Invalid strategy configuration.",
        options:
            Omit<
                StrategyErrorOptions,
                "strategy"
            > = {},
    ):
        StrategyError {

        return new StrategyError(
            message,
            {

                ...options,

                strategy,

            },
        );

    }


    /*
    ======================================================
    Strategy Disabled
    ======================================================
    */

    public static disabled(
        strategy:
            string,
        message:
            string =
                "Strategy is disabled.",
        options:
            Omit<
                StrategyErrorOptions,
                "strategy" |
                "strategyDisabled"
            > = {},
    ):
        StrategyError {

        return new StrategyError(
            message,
            {

                ...options,

                strategy,

                strategyDisabled:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Indicator Missing
    ======================================================
    */

    public static missingIndicator(
        indicator:
            string,
        options:
            Omit<
                StrategyErrorOptions,
                "indicator" |
                "indicatorMissing"
            > = {},
    ):
        StrategyError {

        return new StrategyError(
            `Required indicator "${indicator}" is unavailable.`,
            {

                ...options,

                indicator,

                indicatorMissing:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Signal Failure
    ======================================================
    */

    public static signal(
        message:
            string =
                "Strategy signal generation failed.",
        options:
            Omit<
                StrategyErrorOptions,
                "signalFailure"
            > = {},
    ):
        StrategyError {

        return new StrategyError(
            message,
            {

                ...options,

                signalFailure:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Execution Failure
    ======================================================
    */

    public static execution(
        message:
            string =
                "Strategy execution failed.",
        options:
            Omit<
                StrategyErrorOptions,
                "executionFailure"
            > = {},
    ):
        StrategyError {

        return new StrategyError(
            message,
            {

                ...options,

                executionFailure:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Signal Conflict
    ======================================================
    */

    public static signalConflict(
        signal:
            string,
        message:
            string =
                "Strategy signals are conflicting.",
        options:
            Omit<
                StrategyErrorOptions,
                "signal"
            > = {},
    ):
        StrategyError {

        return new StrategyError(
            message,
            {

                ...options,

                signal,

                retryable:
                    false,

            },
        );

    }

}


/*
==========================================================
 Serialized Strategy Error
==========================================================
*/

export interface StrategyErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly strategy?:
        string;

    readonly strategyVersion?:
        string;

    readonly pair?:
        string;

    readonly timeframe?:
        string;

    readonly operation?:
        string;

    readonly indicator?:
        string;

    readonly signal?:
        string;

    readonly expected?:
        unknown;

    readonly received?:
        unknown;

    readonly retryable:
        boolean;

    readonly strategyDisabled:
        boolean;

    readonly indicatorMissing:
        boolean;

    readonly signalFailure:
        boolean;

    readonly executionFailure:
        boolean;

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

export function createStrategyError(
    message:
        string,
    options:
        StrategyErrorOptions = {},
):
    StrategyError {

    return new StrategyError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize
==========================================================
*/

export function normalizeStrategyError(
    error:
        unknown,
    options:
        StrategyErrorOptions = {},
):
    StrategyError {

    return StrategyError.from(
        error,
        options,
    );

}


/*
==========================================================
 Invalid Strategy Factory
==========================================================
*/

export function createInvalidStrategyError(
    strategy:
        string,
    options:
        Omit<
            StrategyErrorOptions,
            "strategy"
        > = {},
):
    StrategyError {

    return StrategyError.invalidStrategy(
        strategy,
        "Invalid strategy configuration.",
        options,
    );

}


/*
==========================================================
 Disabled Strategy Factory
==========================================================
*/

export function createStrategyDisabledError(
    strategy:
        string,
    options:
        Omit<
            StrategyErrorOptions,
            "strategy" |
            "strategyDisabled"
        > = {},
):
    StrategyError {

    return StrategyError.disabled(
        strategy,
        "Strategy is disabled.",
        options,
    );

}


/*
==========================================================
 Missing Indicator Factory
==========================================================
*/

export function createMissingIndicatorError(
    indicator:
        string,
    options:
        Omit<
            StrategyErrorOptions,
            "indicator" |
            "indicatorMissing"
        > = {},
):
    StrategyError {

    return StrategyError.missingIndicator(
        indicator,
        options,
    );

}


/*
==========================================================
 Signal Error Factory
==========================================================
*/

export function createStrategySignalError(
    options:
        Omit<
            StrategyErrorOptions,
            "signalFailure"
        > = {},
):
    StrategyError {

    return StrategyError.signal(
        "Strategy signal generation failed.",
        options,
    );

}


/*
==========================================================
 Execution Error Factory
==========================================================
*/

export function createStrategyExecutionError(
    options:
        Omit<
            StrategyErrorOptions,
            "executionFailure"
        > = {},
):
    StrategyError {

    return StrategyError.execution(
        "Strategy execution failed.",
        options,
    );

}


/*
==========================================================
 Signal Conflict Factory
==========================================================
*/

export function createStrategySignalConflictError(
    signal:
        string,
    options:
        Omit<
            StrategyErrorOptions,
            "signal"
        > = {},
):
    StrategyError {

    return StrategyError.signalConflict(
        signal,
        "Strategy signals are conflicting.",
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isStrategyError(
    error:
        unknown,
):
    error is StrategyError {

    return (
        error instanceof
        StrategyError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default StrategyError;
