/**
==========================================================
AURA Trade OS
Error Metadata
Version : 0.0.8 Alpha

Perubahan dari 0.0.7: `timestamp`/`startTime`/`endTime` di
DomainErrorMetadata sebelumnya bertipe `string` - bentrok
dengan marketError.ts (dan seluruh codebase lain yang selalu
pakai epoch millis / Date.now(), number) yang mengoper
`options.timestamp ?? options.metadata?.timestamp` ke field
bertipe number. Diperbaiki jadi number, konsisten dengan
pemakaian nyata di seluruh error class.
==========================================================
Structured Error Metadata
==========================================================
*/

import type {
    ErrorCategory,
} from "./errorCategory";

import type {
    ErrorCode,
} from "./errorCode";


/*
==========================================================
 Error Metadata Source
==========================================================
*/

export type ErrorMetadataSource =
    | "system"
    | "configuration"
    | "runtime"
    | "exchange"
    | "market"
    | "order"
    | "portfolio"
    | "strategy"
    | "risk"
    | "scheduler"
    | "pipeline"
    | "plugin"
    | "serialization"
    | "telemetry"
    | "validation"
    | "network"
    | "storage"
    | "external"
    | string;


/*
==========================================================
 Error Documentation
==========================================================
*/

export interface ErrorDocumentation {

    /**
     * Human-readable description.
     */
    readonly description?: string;

    /**
     * Suggested remediation.
     */
    readonly remediation?: string;

    /**
     * Documentation URL.
     */
    readonly documentationUrl?: string;

    /**
     * Internal documentation reference.
     */
    readonly documentationRef?: string;

}


/*
==========================================================
 Error Recovery Metadata
==========================================================
*/

export interface ErrorRecoveryMetadata {

    /**
     * Whether the operation may safely be retried.
     */
    readonly retryable?: boolean;

    /**
     * Maximum recommended retry attempts.
     */
    readonly maxRetries?: number;

    /**
     * Initial retry delay in milliseconds.
     */
    readonly retryDelayMs?: number;

    /**
     * Maximum retry delay in milliseconds.
     */
    readonly maxRetryDelayMs?: number;

    /**
     * Whether exponential backoff is recommended.
     */
    readonly exponentialBackoff?: boolean;

    /**
     * Whether jitter should be applied.
     */
    readonly jitter?: boolean;

    /**
     * Recovery strategy identifier.
     */
    readonly recoveryStrategy?: string;

}


/*
==========================================================
 Error Classification Metadata
==========================================================
*/

export interface ErrorClassificationMetadata {

    /**
     * Error category.
     */
    readonly category?: ErrorCategory;

    /**
     * Error source.
     */
    readonly source?: ErrorMetadataSource;

    /**
     * Whether the error is operational.
     */
    readonly operational?: boolean;

    /**
     * Whether the error is caused by user input.
     */
    readonly userError?: boolean;

    /**
     * Whether the error is caused by an external dependency.
     */
    readonly externalError?: boolean;

    /**
     * Whether the error represents a programming defect.
     */
    readonly programmingError?: boolean;

    /**
     * Whether the error is expected.
     */
    readonly expected?: boolean;

}


/*
==========================================================
 Error Impact Metadata
==========================================================
*/

export type ErrorImpact =
    | "none"
    | "low"
    | "medium"
    | "high"
    | "critical";


export interface ErrorImpactMetadata {

    /**
     * Overall system impact.
     */
    readonly impact?: ErrorImpact;

    /**
     * Whether trading should stop.
     */
    readonly tradingBlocked?: boolean;

    /**
     * Whether strategy execution should stop.
     */
    readonly strategyBlocked?: boolean;

    /**
     * Whether scheduler execution should stop.
     */
    readonly schedulerBlocked?: boolean;

    /**
     * Whether runtime should enter degraded mode.
     */
    readonly runtimeDegraded?: boolean;

}


/*
==========================================================
 Error Telemetry Metadata
==========================================================
*/

export interface ErrorTelemetryMetadata {

    /**
     * Whether this error should be reported.
     */
    readonly reportable?: boolean;

    /**
     * Telemetry event name.
     */
    readonly eventName?: string;

    /**
     * Telemetry severity override.
     */
    readonly telemetrySeverity?:
        | "debug"
        | "info"
        | "warning"
        | "error"
        | "critical";

    /**
     * Whether duplicate occurrences should be grouped.
     */
    readonly aggregate?: boolean;

}


/*
==========================================================
 Domain Extension Metadata
==========================================================
 Additional fields required by domain-specific error
 subclasses. Kept in one flexible bag rather than one
 sub-interface per subclass since many fields (pair,
 exchange, retryAfterMs, operation, ...) are shared across
 several domains.
==========================================================
*/

export interface DomainErrorMetadata {

    // --- Shared / cross-domain ---
    readonly operation?: string;
    readonly retryAfterMs?: number;
    readonly retryCount?: number;
    readonly timeoutMs?: number;
    readonly host?: string;
    readonly port?: number;
    readonly statusCode?: number;
    readonly rateLimited?: boolean;
    readonly degraded?: boolean;
    readonly timeout?: boolean;

    // --- Exchange / Market ---
    readonly exchange?: string;
    readonly exchangeCode?: string;
    readonly pair?: string;
    readonly symbol?: string;
    readonly market?: string;
    readonly dataType?: string;
    readonly timeframe?: string;
    readonly timestamp?: number;
    readonly startTime?: number;
    readonly endTime?: number;
    readonly limit?: number;
    readonly receivedCount?: number;
    readonly expectedCount?: number;
    readonly lastPrice?: number;
    readonly currentPrice?: number;
    readonly bidPrice?: number;
    readonly askPrice?: number;
    readonly spread?: number;
    readonly dataAgeMs?: number;
    readonly maxDataAgeMs?: number;
    readonly symbolUnavailable?: boolean;
    readonly marketUnavailable?: boolean;
    readonly dataUnavailable?: boolean;
    readonly staleData?: boolean;
    readonly invalidData?: boolean;
    readonly incompleteData?: boolean;
    readonly missingCandle?: boolean;
    readonly invalidOHLCV?: boolean;
    readonly invalidOrderBook?: boolean;
    readonly invalidPrice?: boolean;
    readonly invalidVolume?: boolean;
    readonly marketHalted?: boolean;
    readonly insufficientLiquidity?: boolean;

    // --- Network ---
    readonly protocol?: string;
    readonly url?: string;
    readonly method?: string;
    readonly networkCode?: string;
    readonly connectionFailed?: boolean;
    readonly connectionReset?: boolean;
    readonly connectionRefused?: boolean;
    readonly dnsFailure?: boolean;
    readonly responseFailure?: boolean;
    readonly tlsFailure?: boolean;
    readonly networkUnavailable?: boolean;

    // --- Operational / Service ---
    readonly service?: string;
    readonly serviceVersion?: string;
    readonly component?: string;
    readonly dependency?: string;
    readonly dependencyType?: string;
    readonly serviceUnavailable?: boolean;
    readonly dependencyUnavailable?: boolean;
    readonly resourceExhausted?: boolean;
    readonly maintenance?: boolean;
    readonly capacityExceeded?: boolean;

    // --- Risk ---
    readonly riskEngine?: string;
    readonly riskEngineVersion?: string;
    readonly riskProfile?: string;
    readonly metric?: string;
    readonly riskValue?: number;
    readonly riskLimit?: number;
    readonly riskPercent?: number;
    readonly riskLimitPercent?: number;
    readonly exposure?: number;
    readonly exposureLimit?: number;
    readonly drawdownPercent?: number;
    readonly drawdownLimitPercent?: number;
    readonly positionSize?: number;
    readonly positionSizeLimit?: number;
    readonly riskRejected?: boolean;
    readonly limitExceeded?: boolean;
    readonly engineUnavailable?: boolean;
    readonly calculationFailure?: boolean;

    // --- Runtime ---
    readonly runtime?: string;
    readonly runtimeVersion?: string;
    readonly environment?: string;
    readonly processId?: number;
    readonly workerId?: string;
    readonly hostname?: string;
    readonly runtimeState?: string;
    readonly expectedState?: string;
    readonly actualState?: string;
    readonly shuttingDown?: boolean;
    readonly starting?: boolean;
    readonly crashed?: boolean;

    // --- Strategy ---
    readonly strategy?: string;
    readonly strategyVersion?: string;
    readonly indicator?: string;
    readonly signal?: string;
    readonly strategyDisabled?: boolean;
    readonly indicatorMissing?: boolean;
    readonly signalFailure?: boolean;
    readonly executionFailure?: boolean;

    // --- Validation ---
    readonly field?: string;
    readonly path?: string;
    readonly rule?: string;
    readonly recoverable?: boolean;
    readonly schemaValidation?: boolean;
    readonly schema?: string;

}


/*
==========================================================
 Error Metadata
==========================================================
*/

export interface ErrorMetadata
    extends
        ErrorDocumentation,
        ErrorRecoveryMetadata,
        ErrorClassificationMetadata,
        ErrorImpactMetadata,
        ErrorTelemetryMetadata,
        DomainErrorMetadata {

    /**
     * Stable error code.
     */
    readonly code?: ErrorCode;

    /**
     * Human-readable error title.
     */
    readonly title?: string;

    /**
     * Short error description.
     */
    readonly summary?: string;

    /**
     * Error source identifier.
     */
    readonly source?: ErrorMetadataSource;

    /**
     * Version of the metadata definition.
     */
    readonly version?: string;

    /**
     * Additional metadata.
     */
    readonly details?:
        Readonly<
            Record<
                string,
                unknown
            >
        >;

}


/*
==========================================================
 Metadata Defaults
==========================================================
*/

export const DEFAULT_ERROR_METADATA:
    Readonly<ErrorMetadata> = Object.freeze({

        version:
            "1.0.0",

        retryable:
            false,

        operational:
            true,

        expected:
            false,

        reportable:
            true,

        aggregate:
            true,

    });


/*
==========================================================
 Metadata Builder Options
==========================================================
*/

export interface ErrorMetadataBuilderOptions
    extends ErrorMetadata {

    readonly inheritDefaults?: boolean;

}


/*
==========================================================
 Error Metadata Builder
==========================================================
*/

export class ErrorMetadataBuilder {

    private metadata:
        ErrorMetadata = {};


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        initial?:
            ErrorMetadata,
    ) {

        if (
            initial
        ) {

            this.metadata = {

                ...initial,

            };

        }

    }


    /*
    ======================================================
    Code
    ======================================================
    */

    public code(
        code: ErrorCode,
    ): this {

        this.metadata = {

            ...this.metadata,

            code,

        };

        return this;

    }


    /*
    ======================================================
    Title
    ======================================================
    */

    public title(
        title: string,
    ): this {

        this.metadata = {

            ...this.metadata,

            title,

        };

        return this;

    }


    /*
    ======================================================
    Summary
    ======================================================
    */

    public summary(
        summary: string,
    ): this {

        this.metadata = {

            ...this.metadata,

            summary,

        };

        return this;

    }


    /*
    ======================================================
    Description
    ======================================================
    */

    public description(
        description: string,
    ): this {

        this.metadata = {

            ...this.metadata,

            description,

        };

        return this;

    }


    /*
    ======================================================
    Remediation
    ======================================================
    */

    public remediation(
        remediation: string,
    ): this {

        this.metadata = {

            ...this.metadata,

            remediation,

        };

        return this;

    }


    /*
    ======================================================
    Documentation
    ======================================================
    */

    public documentation(
        options: ErrorDocumentation,
    ): this {

        this.metadata = {

            ...this.metadata,

            ...options,

        };

        return this;

    }


    /*
    ======================================================
    Classification
    ======================================================
    */

    public classification(
        options:
            ErrorClassificationMetadata,
    ): this {

        this.metadata = {

            ...this.metadata,

            ...options,

        };

        return this;

    }


    /*
    ======================================================
    Recovery
    ======================================================
    */

    public recovery(
        options:
            ErrorRecoveryMetadata,
    ): this {

        this.metadata = {

            ...this.metadata,

            ...options,

        };

        return this;

    }


    /*
    ======================================================
    Impact
    ======================================================
    */

    public impact(
        options:
            ErrorImpactMetadata,
    ): this {

        this.metadata = {

            ...this.metadata,

            ...options,

        };

        return this;

    }


    /*
    ======================================================
    Telemetry
    ======================================================
    */

    public telemetry(
        options:
            ErrorTelemetryMetadata,
    ): this {

        this.metadata = {

            ...this.metadata,

            ...options,

        };

        return this;

    }


    /*
    ======================================================
    Source
    ======================================================
    */

    public source(
        source:
            ErrorMetadataSource,
    ): this {

        this.metadata = {

            ...this.metadata,

            source,

        };

        return this;

    }


    /*
    ======================================================
    Version
    ======================================================
    */

    public version(
        version: string,
    ): this {

        this.metadata = {

            ...this.metadata,

            version,

        };

        return this;

    }


    /*
    ======================================================
    Details
    ======================================================
    */

    public details(
        details:
            Readonly<
                Record<
                    string,
                    unknown
                >
            >,
    ): this {

        this.metadata = {

            ...this.metadata,

            details: {

                ...(this.metadata.details ?? {}),

                ...details,

            },

        };

        return this;

    }


    /*
    ======================================================
    Build
    ======================================================
    */

    public build(
        inheritDefaults = true,
    ): ErrorMetadata {

        const result =
            inheritDefaults
                ? {

                    ...DEFAULT_ERROR_METADATA,

                    ...this.metadata,

                }
                : {

                    ...this.metadata,

                };


        return Object.freeze({

            ...result,

            details:
                result.details
                    ? Object.freeze({
                        ...result.details,
                    })
                    : undefined,

        });

    }

}


/*
==========================================================
 Create Metadata
==========================================================
*/

export function createErrorMetadata(
    options:
        ErrorMetadataBuilderOptions = {},
): ErrorMetadata {

    const {
        inheritDefaults = true,
        ...metadata
    } = options;


    return new ErrorMetadataBuilder(
        metadata,
    ).build(
        inheritDefaults,
    );

}


/*
==========================================================
 Merge Metadata
==========================================================
*/

export function mergeErrorMetadata(
    base:
        ErrorMetadata | undefined,
    extra:
        ErrorMetadata | undefined,
): ErrorMetadata | undefined {

    if (
        !base &&
        !extra
    ) {

        return undefined;

    }


    if (
        !base
    ) {

        return Object.freeze({

            ...extra,

        });

    }


    if (
        !extra
    ) {

        return Object.freeze({

            ...base,

        });

    }


    return Object.freeze({

        ...base,

        ...extra,

        details: {

            ...(base.details ?? {}),

            ...(extra.details ?? {}),

        },

    });

}


/*
==========================================================
 Metadata Override
==========================================================
*/

export function overrideErrorMetadata(
    metadata:
        ErrorMetadata,
    overrides:
        Partial<ErrorMetadata>,
): ErrorMetadata {

    return Object.freeze({

        ...metadata,

        ...overrides,

        details: {

            ...(metadata.details ?? {}),

            ...(overrides.details ?? {}),

        },

    });

}


/*
==========================================================
 Retryable Check
==========================================================
*/

export function isMetadataRetryable(
    metadata:
        ErrorMetadata | undefined,
): boolean {

    return Boolean(
        metadata?.retryable,
    );

}


/*
==========================================================
 Operational Check
==========================================================
*/

export function isMetadataOperational(
    metadata:
        ErrorMetadata | undefined,
): boolean {

    return metadata?.operational !== false;

}


/*
==========================================================
 Reportable Check
==========================================================
*/

export function isMetadataReportable(
    metadata:
        ErrorMetadata | undefined,
): boolean {

    return metadata?.reportable !== false;

}


/*
==========================================================
 Critical Impact Check
==========================================================
*/

export function hasCriticalImpact(
    metadata:
        ErrorMetadata | undefined,
): boolean {

    return (
        metadata?.impact ===
        "critical"
    );

}


/*
==========================================================
 Trading Block Check
==========================================================
*/

export function isTradingBlocked(
    metadata:
        ErrorMetadata | undefined,
): boolean {

    return Boolean(
        metadata?.tradingBlocked,
    );

}


/*
==========================================================
 Strategy Block Check
==========================================================
*/

export function isStrategyBlocked(
    metadata:
        ErrorMetadata | undefined,
): boolean {

    return Boolean(
        metadata?.strategyBlocked,
    );

}


/*
==========================================================
 Runtime Degraded Check
==========================================================
*/

export function isRuntimeDegraded(
    metadata:
        ErrorMetadata | undefined,
): boolean {

    return Boolean(
        metadata?.runtimeDegraded,
    );

}


/*
==========================================================
 Metadata Sanitization
==========================================================
*/

const SENSITIVE_METADATA_KEYS = [
    "password",
    "passwd",
    "secret",
    "token",
    "apikey",
    "api_key",
    "access_token",
    "refresh_token",
    "private_key",
    "authorization",
    "cookie",
] as const;


/*
==========================================================
 Sensitive Key Detection
==========================================================
*/

function isSensitiveMetadataKey(
    key: string,
): boolean {

    const normalized =
        key.toLowerCase();


    return SENSITIVE_METADATA_KEYS.some(
        sensitive =>
            normalized.includes(
                sensitive,
            ),
    );

}


/*
==========================================================
 Sanitize Value
==========================================================
*/

function sanitizeMetadataValue(
    value: unknown,
): unknown {

    if (
        Array.isArray(
            value,
        )
    ) {

        return value.map(
            sanitizeMetadataValue,
        );

    }


    if (
        value &&
        typeof value === "object"
    ) {

        const source =
            value as Record<
                string,
                unknown
            >;


        const result:
            Record<
                string,
                unknown
            > = {};


        for (
            const [
                key,
                item,
            ]
            of Object.entries(
                source,
            )
        ) {

            if (
                isSensitiveMetadataKey(
                    key,
                )
            ) {

                result[key] =
                    "[REDACTED]";

                continue;

            }


            result[key] =
                sanitizeMetadataValue(
                    item,
                );

        }


        return result;

    }


    return value;

}


/*
==========================================================
 Sanitize Metadata
==========================================================
*/

export function sanitizeErrorMetadata(
    metadata:
        ErrorMetadata,
): ErrorMetadata {

    return Object.freeze(
        sanitizeMetadataValue(
            metadata,
        ) as ErrorMetadata,
    );

}


/*
==========================================================
 Metadata Summary
==========================================================
*/

export interface ErrorMetadataSummary {

    readonly code?: ErrorCode;

    readonly title?: string;

    readonly category?: ErrorCategory;

    readonly source?: ErrorMetadataSource;

    readonly retryable: boolean;

    readonly operational: boolean;

    readonly reportable: boolean;

    readonly impact?: ErrorImpact;

    readonly tradingBlocked: boolean;

    readonly strategyBlocked: boolean;

    readonly schedulerBlocked: boolean;

    readonly runtimeDegraded: boolean;

}


/*
==========================================================
 Summarize Metadata
==========================================================
*/

export function summarizeErrorMetadata(
    metadata:
        ErrorMetadata,
): ErrorMetadataSummary {

    return {

        code:
            metadata.code,

        title:
            metadata.title,

        category:
            metadata.category,

        source:
            metadata.source,

        retryable:
            metadata.retryable ??
            false,

        operational:
            metadata.operational ??
            true,

        reportable:
            metadata.reportable ??
            true,

        impact:
            metadata.impact,

        tradingBlocked:
            metadata.tradingBlocked ??
            false,

        strategyBlocked:
            metadata.strategyBlocked ??
            false,

        schedulerBlocked:
            metadata.schedulerBlocked ??
            false,

        runtimeDegraded:
            metadata.runtimeDegraded ??
            false,

    };

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorMetadataBuilder;
