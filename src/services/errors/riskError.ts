/**
==========================================================
AURA Trade OS
Risk Error
Version : 0.0.7 Alpha
==========================================================
Risk-specific Error Model
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
 Risk Error Options
==========================================================
*/

export interface RiskErrorOptions {

    /**
     * AURA error code.
     */
    readonly code?:
        ErrorCode;

    /**
     * Risk engine identifier.
     */
    readonly riskEngine?:
        string;

    /**
     * Risk engine version.
     */
    readonly riskEngineVersion?:
        string;

    /**
     * Risk profile.
     *
     * Example:
     * low
     * medium
     * high
     */
    readonly riskProfile?:
        string;

    /**
     * Trading pair.
     */
    readonly pair?:
        string;

    /**
     * Timeframe.
     */
    readonly timeframe?:
        string;

    /**
     * Risk operation.
     *
     * Example:
     * evaluate
     * calculate
     * approve
     * reject
     */
    readonly operation?:
        string;

    /**
     * Risk metric.
     *
     * Example:
     * exposure
     * drawdown
     * volatility
     * positionSize
     */
    readonly metric?:
        string;

    /**
     * Risk value.
     */
    readonly riskValue?:
        number;

    /**
     * Maximum allowed risk.
     */
    readonly riskLimit?:
        number;

    /**
     * Risk percentage.
     */
    readonly riskPercent?:
        number;

    /**
     * Maximum allowed risk percentage.
     */
    readonly riskLimitPercent?:
        number;

    /**
     * Exposure value.
     */
    readonly exposure?:
        number;

    /**
     * Maximum allowed exposure.
     */
    readonly exposureLimit?:
        number;

    /**
     * Drawdown percentage.
     */
    readonly drawdownPercent?:
        number;

    /**
     * Maximum allowed drawdown.
     */
    readonly drawdownLimitPercent?:
        number;

    /**
     * Position size.
     */
    readonly positionSize?:
        number;

    /**
     * Maximum allowed position size.
     */
    readonly positionSizeLimit?:
        number;

    /**
     * Whether risk approval was denied.
     */
    readonly riskRejected?:
        boolean;

    /**
     * Whether the risk limit was exceeded.
     */
    readonly limitExceeded?:
        boolean;

    /**
     * Whether the risk engine is unavailable.
     */
    readonly engineUnavailable?:
        boolean;

    /**
     * Whether the calculation failed.
     */
    readonly calculationFailure?:
        boolean;

    /**
     * Whether the risk error can be retried.
     */
    readonly retryable?:
        boolean;

    /**
     * Suggested retry delay.
     */
    readonly retryAfterMs?:
        number;

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
 Risk Error
==========================================================
*/

export class RiskError
    extends AURAError {

    /*
    ======================================================
    Risk Engine
    ======================================================
    */

    public readonly riskEngine:
        string | undefined;


    /*
    ======================================================
    Risk Engine Version
    ======================================================
    */

    public readonly riskEngineVersion:
        string | undefined;


    /*
    ======================================================
    Risk Profile
    ======================================================
    */

    public readonly riskProfile:
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
    Metric
    ======================================================
    */

    public readonly metric:
        string | undefined;


    /*
    ======================================================
    Risk Value
    ======================================================
    */

    public readonly riskValue:
        number | undefined;


    /*
    ======================================================
    Risk Limit
    ======================================================
    */

    public readonly riskLimit:
        number | undefined;


    /*
    ======================================================
    Risk Percent
    ======================================================
    */

    public readonly riskPercent:
        number | undefined;


    /*
    ======================================================
    Risk Limit Percent
    ======================================================
    */

    public readonly riskLimitPercent:
        number | undefined;


    /*
    ======================================================
    Exposure
    ======================================================
    */

    public readonly exposure:
        number | undefined;


    /*
    ======================================================
    Exposure Limit
    ======================================================
    */

    public readonly exposureLimit:
        number | undefined;


    /*
    ======================================================
    Drawdown Percent
    ======================================================
    */

    public readonly drawdownPercent:
        number | undefined;


    /*
    ======================================================
    Drawdown Limit Percent
    ======================================================
    */

    public readonly drawdownLimitPercent:
        number | undefined;


    /*
    ======================================================
    Position Size
    ======================================================
    */

    public readonly positionSize:
        number | undefined;


    /*
    ======================================================
    Position Size Limit
    ======================================================
    */

    public readonly positionSizeLimit:
        number | undefined;


    /*
    ======================================================
    Risk Rejected
    ======================================================
    */

    public readonly riskRejected:
        boolean;


    /*
    ======================================================
    Limit Exceeded
    ======================================================
    */

    public readonly limitExceeded:
        boolean;


    /*
    ======================================================
    Engine Unavailable
    ======================================================
    */

    public readonly engineUnavailable:
        boolean;


    /*
    ======================================================
    Calculation Failure
    ======================================================
    */

    public readonly calculationFailure:
        boolean;


    /*
    ======================================================
    Retryable
    ======================================================
    */

    public readonly retryable:
        boolean;


    /*
    ======================================================
    Retry After
    ======================================================
    */

    public readonly retryAfterMs:
        number | undefined;


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
            RiskErrorOptions = {},
    ) {

        const severity =
            RiskError.resolveSeverity(
                options,
            );


        const context:
            ErrorContext = {

            ...(options.context ?? {}),

            source:
                "risk",

            service:
                options.context?.service ??
                "risk-service",

            riskEngine:
                options.riskEngine ??
                options.context?.riskEngine,

            riskProfile:
                options.riskProfile ??
                options.context?.riskProfile,

            pair:
                options.pair ??
                options.context?.pair,

            timeframe:
                options.timeframe ??
                options.context?.timeframe,

            operation:
                options.operation ??
                options.context?.operation,

            metric:
                options.metric ??
                options.context?.metric,

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

            riskEngine:
                options.riskEngine ??
                options.metadata?.riskEngine,

            riskEngineVersion:
                options.riskEngineVersion ??
                options.metadata?.riskEngineVersion,

            riskProfile:
                options.riskProfile ??
                options.metadata?.riskProfile,

            pair:
                options.pair ??
                options.metadata?.pair,

            timeframe:
                options.timeframe ??
                options.metadata?.timeframe,

            operation:
                options.operation ??
                options.metadata?.operation,

            metric:
                options.metric ??
                options.metadata?.metric,

            riskValue:
                options.riskValue ??
                options.metadata?.riskValue,

            riskLimit:
                options.riskLimit ??
                options.metadata?.riskLimit,

            riskPercent:
                options.riskPercent ??
                options.metadata?.riskPercent,

            riskLimitPercent:
                options.riskLimitPercent ??
                options.metadata?.riskLimitPercent,

            exposure:
                options.exposure ??
                options.metadata?.exposure,

            exposureLimit:
                options.exposureLimit ??
                options.metadata?.exposureLimit,

            drawdownPercent:
                options.drawdownPercent ??
                options.metadata?.drawdownPercent,

            drawdownLimitPercent:
                options.drawdownLimitPercent ??
                options.metadata?.drawdownLimitPercent,

            positionSize:
                options.positionSize ??
                options.metadata?.positionSize,

            positionSizeLimit:
                options.positionSizeLimit ??
                options.metadata?.positionSizeLimit,

            riskRejected:
                options.riskRejected ??
                options.metadata?.riskRejected,

            limitExceeded:
                options.limitExceeded ??
                options.metadata?.limitExceeded,

            engineUnavailable:
                options.engineUnavailable ??
                options.metadata?.engineUnavailable,

            calculationFailure:
                options.calculationFailure ??
                options.metadata?.calculationFailure,

            retryable:
                options.retryable ??
                options.metadata?.retryable,

            retryAfterMs:
                options.retryAfterMs ??
                options.metadata?.retryAfterMs,

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
            "RiskError";


        this.riskEngine =
            options.riskEngine;


        this.riskEngineVersion =
            options.riskEngineVersion;


        this.riskProfile =
            options.riskProfile;


        this.pair =
            options.pair;


        this.timeframe =
            options.timeframe;


        this.operation =
            options.operation;


        this.metric =
            options.metric;


        this.riskValue =
            options.riskValue;


        this.riskLimit =
            options.riskLimit;


        this.riskPercent =
            options.riskPercent;


        this.riskLimitPercent =
            options.riskLimitPercent;


        this.exposure =
            options.exposure;


        this.exposureLimit =
            options.exposureLimit;


        this.drawdownPercent =
            options.drawdownPercent;


        this.drawdownLimitPercent =
            options.drawdownLimitPercent;


        this.positionSize =
            options.positionSize;


        this.positionSizeLimit =
            options.positionSizeLimit;


        this.riskRejected =
            options.riskRejected ??
            false;


        this.limitExceeded =
            options.limitExceeded ??
            false;


        this.engineUnavailable =
            options.engineUnavailable ??
            false;


        this.calculationFailure =
            options.calculationFailure ??
            false;


        this.retryable =
            options.retryable ??
            RiskError.defaultRetryable(
                options,
            );


        this.retryAfterMs =
            options.retryAfterMs;


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
            RiskErrorOptions,
    ):
        ErrorSeverity {

        if (
            options.engineUnavailable
        ) {

            return ErrorSeverity.CRITICAL;

        }


        if (
            options.calculationFailure
        ) {

            return ErrorSeverity.ERROR;

        }


        if (
            options.limitExceeded
        ) {

            return ErrorSeverity.WARNING;

        }


        if (
            options.riskRejected
        ) {

            return ErrorSeverity.WARNING;

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
            RiskErrorOptions,
    ):
        boolean {

        if (
            options.riskRejected
        ) {

            return false;

        }


        if (
            options.limitExceeded
        ) {

            return false;

        }


        if (
            options.engineUnavailable
        ) {

            return true;

        }


        if (
            options.calculationFailure
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
    Is Risk Rejected
    ======================================================
    */

    public isRiskRejected():
        boolean {

        return this.riskRejected;

    }


    /*
    ======================================================
    Is Limit Exceeded
    ======================================================
    */

    public isLimitExceeded():
        boolean {

        return this.limitExceeded;

    }


    /*
    ======================================================
    Is Engine Unavailable
    ======================================================
    */

    public isEngineUnavailable():
        boolean {

        return this.engineUnavailable;

    }


    /*
    ======================================================
    Is Calculation Failure
    ======================================================
    */

    public isCalculationFailure():
        boolean {

        return this.calculationFailure;

    }


    /*
    ======================================================
    Get Risk Engine
    ======================================================
    */

    public getRiskEngine():
        string | undefined {

        return this.riskEngine;

    }


    /*
    ======================================================
    Get Risk Profile
    ======================================================
    */

    public getRiskProfile():
        string | undefined {

        return this.riskProfile;

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
    Get Metric
    ======================================================
    */

    public getMetric():
        string | undefined {

        return this.metric;

    }


    /*
    ======================================================
    Get Risk Value
    ======================================================
    */

    public getRiskValue():
        number | undefined {

        return this.riskValue;

    }


    /*
    ======================================================
    Get Risk Limit
    ======================================================
    */

    public getRiskLimit():
        number | undefined {

        return this.riskLimit;

    }


    /*
    ======================================================
    Get Exposure
    ======================================================
    */

    public getExposure():
        number | undefined {

        return this.exposure;

    }


    /*
    ======================================================
    Get Position Size
    ======================================================
    */

    public getPositionSize():
        number | undefined {

        return this.positionSize;

    }


    /*
    ======================================================
    Is Risk Above Limit
    ======================================================
    */

    public isRiskAboveLimit():
        boolean {

        if (
            this.riskValue ===
                undefined ||
            this.riskLimit ===
                undefined
        ) {

            return this.limitExceeded;

        }


        return (
            this.riskValue >
            this.riskLimit
        );

    }


    /*
    ======================================================
    Is Exposure Above Limit
    ======================================================
    */

    public isExposureAboveLimit():
        boolean {

        if (
            this.exposure ===
                undefined ||
            this.exposureLimit ===
                undefined
        ) {

            return false;

        }


        return (
            this.exposure >
            this.exposureLimit
        );

    }


    /*
    ======================================================
    Is Drawdown Above Limit
    ======================================================
    */

    public isDrawdownAboveLimit():
        boolean {

        if (
            this.drawdownPercent ===
                undefined ||
            this.drawdownLimitPercent ===
                undefined
        ) {

            return false;

        }


        return (
            this.drawdownPercent >
            this.drawdownLimitPercent
        );

    }


    /*
    ======================================================
    Is Position Above Limit
    ======================================================
    */

    public isPositionSizeAboveLimit():
        boolean {

        if (
            this.positionSize ===
                undefined ||
            this.positionSizeLimit ===
                undefined
        ) {

            return false;

        }


        return (
            this.positionSize >
            this.positionSizeLimit
        );

    }


    /*
    ======================================================
    Risk Utilization
    ======================================================
    */

    public getRiskUtilization():
        number | undefined {

        if (
            this.riskValue ===
                undefined ||
            this.riskLimit ===
                undefined ||
            this.riskLimit ===
                0
        ) {

            return undefined;

        }


        return (
            this.riskValue /
            this.riskLimit
        );

    }


    /*
    ======================================================
    To Risk Object
    ======================================================
    */

    public toRiskObject():
        RiskErrorSerialized {

        return {

            name:
                this.name,

            message:
                this.message,

            code:
                this.code,

            severity:
                this.severity,

            riskEngine:
                this.riskEngine,

            riskEngineVersion:
                this.riskEngineVersion,

            riskProfile:
                this.riskProfile,

            pair:
                this.pair,

            timeframe:
                this.timeframe,

            operation:
                this.operation,

            metric:
                this.metric,

            riskValue:
                this.riskValue,

            riskLimit:
                this.riskLimit,

            riskPercent:
                this.riskPercent,

            riskLimitPercent:
                this.riskLimitPercent,

            exposure:
                this.exposure,

            exposureLimit:
                this.exposureLimit,

            drawdownPercent:
                this.drawdownPercent,

            drawdownLimitPercent:
                this.drawdownLimitPercent,

            positionSize:
                this.positionSize,

            positionSizeLimit:
                this.positionSizeLimit,

            riskRejected:
                this.riskRejected,

            limitExceeded:
                this.limitExceeded,

            engineUnavailable:
                this.engineUnavailable,

            calculationFailure:
                this.calculationFailure,

            retryable:
                this.retryable,

            retryAfterMs:
                this.retryAfterMs,

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
            RiskErrorOptions = {},
    ):
        RiskError {

        if (
            error instanceof
            RiskError
        ) {

            return error;

        }


        if (
            error instanceof Error
        ) {

            return new RiskError(
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

            return new RiskError(
                error,
                options,
            );

        }


        return new RiskError(
            "Unknown risk error.",
            options,
        );

    }


    /*
    ======================================================
    Risk Rejected
    ======================================================
    */

    public static rejected(
        message:
            string =
                "Trade rejected by risk engine.",
        options:
            Omit<
                RiskErrorOptions,
                "riskRejected"
            > = {},
    ):
        RiskError {

        return new RiskError(
            message,
            {

                ...options,

                riskRejected:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Limit Exceeded
    ======================================================
    */

    public static limitExceeded(
        message:
            string =
                "Risk limit exceeded.",
        options:
            Omit<
                RiskErrorOptions,
                "limitExceeded"
            > = {},
    ):
        RiskError {

        return new RiskError(
            message,
            {

                ...options,

                limitExceeded:
                    true,

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Exposure Exceeded
    ======================================================
    */

    public static exposureExceeded(
        exposure:
            number,
        exposureLimit:
            number,
        options:
            Omit<
                RiskErrorOptions,
                "exposure" |
                "exposureLimit" |
                "limitExceeded"
            > = {},
    ):
        RiskError {

        return new RiskError(
            "Maximum exposure limit exceeded.",
            {

                ...options,

                exposure,

                exposureLimit,

                limitExceeded:
                    true,

                metric:
                    options.metric ??
                    "exposure",

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Drawdown Exceeded
    ======================================================
    */

    public static drawdownExceeded(
        drawdownPercent:
            number,
        drawdownLimitPercent:
            number,
        options:
            Omit<
                RiskErrorOptions,
                "drawdownPercent" |
                "drawdownLimitPercent" |
                "limitExceeded"
            > = {},
    ):
        RiskError {

        return new RiskError(
            "Maximum drawdown limit exceeded.",
            {

                ...options,

                drawdownPercent,

                drawdownLimitPercent,

                limitExceeded:
                    true,

                metric:
                    options.metric ??
                    "drawdown",

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Position Size Exceeded
    ======================================================
    */

    public static positionSizeExceeded(
        positionSize:
            number,
        positionSizeLimit:
            number,
        options:
            Omit<
                RiskErrorOptions,
                "positionSize" |
                "positionSizeLimit" |
                "limitExceeded"
            > = {},
    ):
        RiskError {

        return new RiskError(
            "Maximum position size exceeded.",
            {

                ...options,

                positionSize,

                positionSizeLimit,

                limitExceeded:
                    true,

                metric:
                    options.metric ??
                    "positionSize",

                retryable:
                    false,

            },
        );

    }


    /*
    ======================================================
    Engine Unavailable
    ======================================================
    */

    public static engineUnavailable(
        message:
            string =
                "Risk engine is unavailable.",
        options:
            Omit<
                RiskErrorOptions,
                "engineUnavailable"
            > = {},
    ):
        RiskError {

        return new RiskError(
            message,
            {

                ...options,

                engineUnavailable:
                    true,

                retryable:
                    true,

            },
        );

    }


    /*
    ======================================================
    Calculation Failure
    ======================================================
    */

    public static calculation(
        message:
            string =
                "Risk calculation failed.",
        options:
            Omit<
                RiskErrorOptions,
                "calculationFailure"
            > = {},
    ):
        RiskError {

        return new RiskError(
            message,
            {

                ...options,

                calculationFailure:
                    true,

                retryable:
                    true,

            },
        );

    }

}


/*
==========================================================
 Serialized Risk Error
==========================================================
*/

export interface RiskErrorSerialized {

    readonly name:
        string;

    readonly message:
        string;

    readonly code?:
        ErrorCode;

    readonly severity?:
        ErrorSeverity;

    readonly riskEngine?:
        string;

    readonly riskEngineVersion?:
        string;

    readonly riskProfile?:
        string;

    readonly pair?:
        string;

    readonly timeframe?:
        string;

    readonly operation?:
        string;

    readonly metric?:
        string;

    readonly riskValue?:
        number;

    readonly riskLimit?:
        number;

    readonly riskPercent?:
        number;

    readonly riskLimitPercent?:
        number;

    readonly exposure?:
        number;

    readonly exposureLimit?:
        number;

    readonly drawdownPercent?:
        number;

    readonly drawdownLimitPercent?:
        number;

    readonly positionSize?:
        number;

    readonly positionSizeLimit?:
        number;

    readonly riskRejected:
        boolean;

    readonly limitExceeded:
        boolean;

    readonly engineUnavailable:
        boolean;

    readonly calculationFailure:
        boolean;

    readonly retryable:
        boolean;

    readonly retryAfterMs?:
        number;

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

export function createRiskError(
    message:
        string,
    options:
        RiskErrorOptions = {},
):
    RiskError {

    return new RiskError(
        message,
        options,
    );

}


/*
==========================================================
 Normalize
==========================================================
*/

export function normalizeRiskError(
    error:
        unknown,
    options:
        RiskErrorOptions = {},
):
    RiskError {

    return RiskError.from(
        error,
        options,
    );

}


/*
==========================================================
 Rejected Factory
==========================================================
*/

export function createRiskRejectedError(
    options:
        Omit<
            RiskErrorOptions,
            "riskRejected"
        > = {},
):
    RiskError {

    return RiskError.rejected(
        "Trade rejected by risk engine.",
        options,
    );

}


/*
==========================================================
 Limit Factory
==========================================================
*/

export function createRiskLimitExceededError(
    options:
        Omit<
            RiskErrorOptions,
            "limitExceeded"
        > = {},
):
    RiskError {

    return RiskError.limitExceeded(
        "Risk limit exceeded.",
        options,
    );

}


/*
==========================================================
 Exposure Factory
==========================================================
*/

export function createRiskExposureExceededError(
    exposure:
        number,
    exposureLimit:
        number,
    options:
        Omit<
            RiskErrorOptions,
            "exposure" |
            "exposureLimit" |
            "limitExceeded"
        > = {},
):
    RiskError {

    return RiskError.exposureExceeded(
        exposure,
        exposureLimit,
        options,
    );

}


/*
==========================================================
 Drawdown Factory
==========================================================
*/

export function createRiskDrawdownExceededError(
    drawdownPercent:
        number,
    drawdownLimitPercent:
        number,
    options:
        Omit<
            RiskErrorOptions,
            "drawdownPercent" |
            "drawdownLimitPercent" |
            "limitExceeded"
        > = {},
):
    RiskError {

    return RiskError.drawdownExceeded(
        drawdownPercent,
        drawdownLimitPercent,
        options,
    );

}


/*
==========================================================
 Position Size Factory
==========================================================
*/

export function createRiskPositionSizeExceededError(
    positionSize:
        number,
    positionSizeLimit:
        number,
    options:
        Omit<
            RiskErrorOptions,
            "positionSize" |
            "positionSizeLimit" |
            "limitExceeded"
        > = {},
):
    RiskError {

    return RiskError.positionSizeExceeded(
        positionSize,
        positionSizeLimit,
        options,
    );

}


/*
==========================================================
 Engine Factory
==========================================================
*/

export function createRiskEngineUnavailableError(
    options:
        Omit<
            RiskErrorOptions,
            "engineUnavailable"
        > = {},
):
    RiskError {

    return RiskError.engineUnavailable(
        "Risk engine is unavailable.",
        options,
    );

}


/*
==========================================================
 Calculation Factory
==========================================================
*/

export function createRiskCalculationError(
    options:
        Omit<
            RiskErrorOptions,
            "calculationFailure"
        > = {},
):
    RiskError {

    return RiskError.calculation(
        "Risk calculation failed.",
        options,
    );

}


/*
==========================================================
 Type Guard
==========================================================
*/

export function isRiskError(
    error:
        unknown,
):
    error is RiskError {

    return (
        error instanceof
        RiskError
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default RiskError;
