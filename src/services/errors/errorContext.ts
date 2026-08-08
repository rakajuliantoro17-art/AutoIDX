/**
==========================================================
AURA Trade OS
Error Context
Version : 0.0.7 Alpha
==========================================================
Structured Operational Error Context
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
Execution Context
==========================================================
*/

export interface ExecutionErrorContext {

    /**
     * Unique identifier for the current execution.
     */
    readonly executionId?: string;

    /**
     * Parent execution identifier.
     */
    readonly parentExecutionId?: string;

    /**
     * Correlation identifier shared across services.
     */
    readonly correlationId?: string;

    /**
     * Request identifier.
     */
    readonly requestId?: string;

    /**
     * Session identifier.
     */
    readonly sessionId?: string;

    /**
     * Worker / process identifier.
     */
    readonly workerId?: string;

}


/*
==========================================================
Service Context
==========================================================
*/

export interface ServiceErrorContext {

    /**
     * Service name.
     */
    readonly service?: string;

    /**
     * Service version.
     */
    readonly serviceVersion?: string;

    /**
     * Module name.
     */
    readonly module?: string;

    /**
     * Component name.
     */
    readonly component?: string;

    /**
     * Operation being executed.
     */
    readonly operation?: string;

}


/*
==========================================================
Runtime Context
==========================================================
*/

export interface RuntimeErrorContext {

    /**
     * Runtime environment.
     */
    readonly environment?:
        | "development"
        | "test"
        | "staging"
        | "production"
        | string;

    /**
     * Runtime profile.
     */
    readonly profile?: string;

    /**
     * Runtime version.
     */
    readonly runtimeVersion?: string;

    /**
     * Node.js version.
     */
    readonly nodeVersion?: string;

    /**
     * Hostname.
     */
    readonly hostname?: string;

}


/*
==========================================================
Trading Context
==========================================================
*/

export interface TradingErrorContext {

    /**
     * Exchange identifier.
     *
     * Example:
     * "indodax"
     */
    readonly exchange?: string;

    /**
     * Trading pair.
     *
     * Example:
     * "btc_idr"
     */
    readonly pair?: string;

    /**
     * Market symbol.
     */
    readonly symbol?: string;

    /**
     * Order identifier.
     */
    readonly orderId?: string;

    /**
     * Client-side order identifier.
     */
    readonly clientOrderId?: string;

    /**
     * Position identifier.
     */
    readonly positionId?: string;

    /**
     * Strategy identifier.
     */
    readonly strategyId?: string;

    /**
     * Portfolio identifier.
     */
    readonly portfolioId?: string;

}


/*
==========================================================
Scheduler Context
==========================================================
*/

export interface SchedulerErrorContext {

    /**
     * Scheduler identifier.
     */
    readonly schedulerId?: string;

    /**
     * Task identifier.
     */
    readonly taskId?: string;

    /**
     * Job identifier.
     */
    readonly jobId?: string;

    /**
     * Cron expression.
     */
    readonly cronExpression?: string;

    /**
     * Scheduler execution attempt.
     */
    readonly attempt?: number;

}


/*
==========================================================
Plugin Context
==========================================================
*/

export interface PluginErrorContext {

    /**
     * Plugin identifier.
     */
    readonly pluginId?: string;

    /**
     * Plugin name.
     */
    readonly pluginName?: string;

    /**
     * Plugin version.
     */
    readonly pluginVersion?: string;

    /**
     * Plugin lifecycle phase.
     */
    readonly lifecycle?:
        | "load"
        | "validate"
        | "initialize"
        | "start"
        | "execute"
        | "stop"
        | "unload"
        | string;

}


/*
==========================================================
Network Context
==========================================================
*/

export interface NetworkErrorContext {

    /**
     * Request method.
     */
    readonly method?:
        | "GET"
        | "POST"
        | "PUT"
        | "PATCH"
        | "DELETE"
        | "HEAD"
        | "OPTIONS"
        | string;

    /**
     * Request URL.
     *
     * Do not store credentials or secrets here.
     */
    readonly url?: string;

    /**
     * Remote host.
     */
    readonly host?: string;

    /**
     * Remote port.
     */
    readonly port?: number;

    /**
     * HTTP status code.
     */
    readonly statusCode?: number;

    /**
     * Network request attempt.
     */
    readonly attempt?: number;

}


/*
==========================================================
Validation Context
==========================================================
*/

export interface ValidationErrorContext {

    /**
     * Schema name.
     */
    readonly schema?: string;

    /**
     * Validation rule.
     */
    readonly rule?: string;

    /**
     * Field path.
     *
     * Example:
     * "strategy.risk.stopLoss"
     */
    readonly field?: string;

}


/*
==========================================================
 Storage Context
==========================================================
*/

export interface StorageErrorContext {

    /**
     * Storage provider.
     */
    readonly provider?: string;

    /**
     * Storage resource.
     */
    readonly resource?: string;

    /**
     * Storage operation.
     */
    readonly operation?:
        | "read"
        | "write"
        | "delete"
        | "exists"
        | "list"
        | string;

}


/*
==========================================================
 Error Context
==========================================================
*/

export interface ErrorContext
    extends
        ExecutionErrorContext,
        ServiceErrorContext,
        RuntimeErrorContext,
        TradingErrorContext,
        SchedulerErrorContext,
        PluginErrorContext,
        NetworkErrorContext,
        ValidationErrorContext,
        StorageErrorContext {

    /**
     * Error code associated with this context.
     */
    readonly code?: ErrorCode;

    /**
     * Error category.
     */
    readonly category?: ErrorCategory;

    /**
     * Timestamp when the error occurred.
     */
    readonly timestamp?: string;

    /**
     * Source file or logical source.
     */
    readonly source?: string;

    /**
     * Additional tags.
     */
    readonly tags?: readonly string[];

    /**
     * Additional structured context.
     *
     * Must not contain secrets.
     */
    readonly details?: Readonly<
        Record<
            string,
            unknown
        >
    >;

}


/*
==========================================================
 Error Context Builder Options
==========================================================
*/

export interface ErrorContextBuilderOptions {

    readonly code?: ErrorCode;

    readonly category?: ErrorCategory;

    readonly timestamp?: string;

    readonly source?: string;

    readonly execution?: ExecutionErrorContext;

    readonly service?: ServiceErrorContext;

    readonly runtime?: RuntimeErrorContext;

    readonly trading?: TradingErrorContext;

    readonly scheduler?: SchedulerErrorContext;

    readonly plugin?: PluginErrorContext;

    readonly network?: NetworkErrorContext;

    readonly validation?: ValidationErrorContext;

    readonly storage?: StorageErrorContext;

    readonly tags?: readonly string[];

    readonly details?: Readonly<
        Record<
            string,
            unknown
        >
    >;

}


/*
==========================================================
 Error Context Builder
==========================================================
*/

export class ErrorContextBuilder {

    private context: ErrorContext = {};


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        initial?: ErrorContext,
    ) {

        if (
            initial
        ) {

            this.context = {
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

        this.context = {

            ...this.context,

            code,

        };

        return this;

    }


    /*
    ======================================================
    Category
    ======================================================
    */

    public category(
        category: ErrorCategory,
    ): this {

        this.context = {

            ...this.context,

            category,

        };

        return this;

    }


    /*
    ======================================================
    Timestamp
    ======================================================
    */

    public timestamp(
        timestamp = new Date().toISOString(),
    ): this {

        this.context = {

            ...this.context,

            timestamp,

        };

        return this;

    }


    /*
    ======================================================
    Source
    ======================================================
    */

    public source(
        source: string,
    ): this {

        this.context = {

            ...this.context,

            source,

        };

        return this;

    }


    /*
    ======================================================
    Execution
    ======================================================
    */

    public execution(
        context: ExecutionErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Service
    ======================================================
    */

    public service(
        context: ServiceErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Runtime
    ======================================================
    */

    public runtime(
        context: RuntimeErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Trading
    ======================================================
    */

    public trading(
        context: TradingErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Scheduler
    ======================================================
    */

    public scheduler(
        context: SchedulerErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Plugin
    ======================================================
    */

    public plugin(
        context: PluginErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Network
    ======================================================
    */

    public network(
        context: NetworkErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Validation
    ======================================================
    */

    public validation(
        context: ValidationErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Storage
    ======================================================
    */

    public storage(
        context: StorageErrorContext,
    ): this {

        this.context = {

            ...this.context,

            ...context,

        };

        return this;

    }


    /*
    ======================================================
    Tags
    ======================================================
    */

    public tags(
        ...tags: string[]
    ): this {

        const current =
            this.context.tags ?? [];


        this.context = {

            ...this.context,

            tags: [
                ...new Set(
                    [
                        ...current,
                        ...tags,
                    ],
                ),
            ],

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

        this.context = {

            ...this.context,

            details: {

                ...(this.context.details ?? {}),

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

    public build(): ErrorContext {

        return Object.freeze({

            ...this.context,

            tags:
                this.context.tags
                    ? Object.freeze([
                        ...this.context.tags,
                    ])
                    : undefined,

            details:
                this.context.details
                    ? Object.freeze({
                        ...this.context.details,
                    })
                    : undefined,

        });

    }

}


/*
==========================================================
 Factory
==========================================================
*/

export function createErrorContext(
    options:
        ErrorContextBuilderOptions = {},
): ErrorContext {

    const builder =
        new ErrorContextBuilder();


    if (
        options.code
    ) {

        builder.code(
            options.code,
        );

    }


    if (
        options.category
    ) {

        builder.category(
            options.category,
        );

    }


    if (
        options.timestamp
    ) {

        builder.timestamp(
            options.timestamp,
        );

    }


    if (
        options.source
    ) {

        builder.source(
            options.source,
        );

    }


    if (
        options.execution
    ) {

        builder.execution(
            options.execution,
        );

    }


    if (
        options.service
    ) {

        builder.service(
            options.service,
        );

    }


    if (
        options.runtime
    ) {

        builder.runtime(
            options.runtime,
        );

    }


    if (
        options.trading
    ) {

        builder.trading(
            options.trading,
        );

    }


    if (
        options.scheduler
    ) {

        builder.scheduler(
            options.scheduler,
        );

    }


    if (
        options.plugin
    ) {

        builder.plugin(
            options.plugin,
        );

    }


    if (
        options.network
    ) {

        builder.network(
            options.network,
        );

    }


    if (
        options.validation
    ) {

        builder.validation(
            options.validation,
        );

    }


    if (
        options.storage
    ) {

        builder.storage(
            options.storage,
        );

    }


    if (
        options.tags
    ) {

        builder.tags(
            ...options.tags,
        );

    }


    if (
        options.details
    ) {

        builder.details(
            options.details,
        );

    }


    return builder.build();

}


/*
==========================================================
 Merge Context
==========================================================
*/

export function mergeErrorContext(
    base: ErrorContext | undefined,
    extra: ErrorContext | undefined,
): ErrorContext {

    if (
        !base &&
        !extra
    ) {

        return {};

    }


    if (
        !base
    ) {

        return {
            ...(extra as ErrorContext),
        };

    }


    if (
        !extra
    ) {

        return {
            ...base,
        };

    }


    return {

        ...base,

        ...extra,

        tags:
            [
                ...(base.tags ?? []),
                ...(extra.tags ?? []),
            ].filter(
                (
                    value,
                    index,
                    array,
                ) =>
                    array.indexOf(
                        value,
                    ) === index,
            ),

        details: {

            ...(base.details ?? {}),

            ...(extra.details ?? {}),

        },

    };

}


/*
==========================================================
 Sanitize Context
==========================================================
*/

const SENSITIVE_KEYS = [
    "password",
    "passwd",
    "secret",
    "token",
    "apiKey",
    "api_key",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "privateKey",
    "private_key",
    "authorization",
    "cookie",
] as const;


function isSensitiveKey(
    key: string,
): boolean {

    const normalized =
        key.toLowerCase();


    return SENSITIVE_KEYS.some(
        sensitive =>
            normalized.includes(
                sensitive.toLowerCase(),
            ),
    );

}


/*
==========================================================
 Sanitize Value
==========================================================
*/

function sanitizeValue(
    value: unknown,
): unknown {

    if (
        Array.isArray(value)
    ) {

        return value.map(
            sanitizeValue,
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
            ] of Object.entries(
                source,
            )
        ) {

            if (
                isSensitiveKey(
                    key,
                )
            ) {

                result[key] =
                    "[REDACTED]";

                continue;

            }


            result[key] =
                sanitizeValue(
                    item,
                );

        }


        return result;

    }


    return value;

}


/*
==========================================================
 Sanitize Error Context
==========================================================
*/

export function sanitizeErrorContext(
    context: ErrorContext,
): ErrorContext {

    const sanitized =
        sanitizeValue(
            context,
        ) as ErrorContext;


    return Object.freeze(
        sanitized,
    );

}


/*
==========================================================
 Context ID
==========================================================
*/

export function getErrorContextId(
    context: ErrorContext,
): string {

    if (
        context.correlationId
    ) {

        return context.correlationId;

    }


    if (
        context.executionId
    ) {

        return context.executionId;

    }


    if (
        context.requestId
    ) {

        return context.requestId;

    }


    return "unknown";

}


/*
==========================================================
 Context Summary
==========================================================
*/

export interface ErrorContextSummary {

    readonly id: string;

    readonly service?: string;

    readonly module?: string;

    readonly component?: string;

    readonly operation?: string;

    readonly category?: ErrorCategory;

    readonly code?: ErrorCode;

    readonly exchange?: string;

    readonly pair?: string;

    readonly strategyId?: string;

}


/*
==========================================================
 Summarize Context
==========================================================
*/

export function summarizeErrorContext(
    context: ErrorContext,
): ErrorContextSummary {

    return {

        id:
            getErrorContextId(
                context,
            ),

        service:
            context.service,

        module:
            context.module,

        component:
            context.component,

        operation:
            context.operation,

        category:
            context.category,

        code:
            context.code,

        exchange:
            context.exchange,

        pair:
            context.pair,

        strategyId:
            context.strategyId,

    };

}
