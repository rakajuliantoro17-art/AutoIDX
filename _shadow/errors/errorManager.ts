/**
==========================================================
AURA Trade OS
Error Manager
Version : 0.0.7 Alpha
==========================================================
Centralized Error State & Lifecycle Management
==========================================================
*/

import {
    AURAError,
    normalizeAURAError,
} from "./error";

import {
    ErrorFactory,
} from "./errorFactory";

import {
    ErrorHandler,
} from "./errorHandler";

import type {
    ErrorHandlerOptions,
    ErrorHandlerResult,
} from "./errorHandler";

import type {
    ErrorContext,
} from "./errorContext";

import {
    getErrorContextId,
    sanitizeErrorContext,
    summarizeErrorContext,
} from "./errorContext";

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


/*
==========================================================
 Error Lifecycle
==========================================================
*/

export type ErrorLifecycleStatus =
    | "active"
    | "acknowledged"
    | "resolved"
    | "ignored";


/*
==========================================================
 Error Record
==========================================================
*/

export interface ErrorRecord {

    /**
     * Unique internal error identifier.
     */
    readonly id: string;

    /**
     * Error code.
     */
    readonly code?: ErrorCode;

    /**
     * Error category.
     */
    readonly category: ErrorCategory;

    /**
     * Original error message.
     */
    readonly message: string;

    /**
     * Error name.
     */
    readonly name: string;

    /**
     * Error severity.
     */
    readonly severity?: string;

    /**
     * Number of occurrences.
     */
    readonly occurrences: number;

    /**
     * First occurrence timestamp.
     */
    readonly firstSeenAt: string;

    /**
     * Last occurrence timestamp.
     */
    readonly lastSeenAt: string;

    /**
     * Current lifecycle state.
     */
    readonly status: ErrorLifecycleStatus;

    /**
     * Whether the error is retryable.
     */
    readonly retryable: boolean;

    /**
     * Whether the error is operational.
     */
    readonly operational: boolean;

    /**
     * Structured context.
     */
    readonly context: ErrorContext;

    /**
     * Error summary.
     */
    readonly summary: ReturnType<
        typeof summarizeErrorContext
    >;

}


/*
==========================================================
 Error Statistics
==========================================================
*/

export interface ErrorStatistics {

    readonly total: number;

    readonly active: number;

    readonly acknowledged: number;

    readonly resolved: number;

    readonly ignored: number;

    readonly retryable: number;

    readonly critical: number;

    readonly errors: number;

    readonly warnings: number;

    readonly byCategory:
        Readonly<
            Record<
                string,
                number
            >
        >;

    readonly byCode:
        Readonly<
            Record<
                string,
                number
            >
        >;

}


/*
==========================================================
 Error Manager Options
==========================================================
*/

export interface ErrorManagerOptions {

    /**
     * Maximum records retained.
     *
     * Default: 1000
     */
    readonly maxRecords?: number;

    /**
     * Whether repeated identical errors
     * should be grouped.
     *
     * Default: true
     */
    readonly deduplicate?: boolean;

    /**
     * Whether error contexts are sanitized.
     *
     * Default: true
     */
    readonly sanitize?: boolean;

    /**
     * Whether ErrorHandler should log.
     *
     * Default: true
     */
    readonly log?: boolean;

}


/*
==========================================================
 Error Manager
==========================================================
*/

export class ErrorManager {

    /*
    ======================================================
    Internal State
    ======================================================
    */

    private readonly records:
        Map<
            string,
            ErrorRecord
        >;

    private readonly options:
        Required<
            ErrorManagerOptions
        >;


    /*
    ======================================================
    Sequence
    ======================================================
    */

    private sequence = 0;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        options:
            ErrorManagerOptions = {},
    ) {

        this.options = {

            maxRecords:
                options.maxRecords ??
                1000,

            deduplicate:
                options.deduplicate ??
                true,

            sanitize:
                options.sanitize ??
                true,

            log:
                options.log ??
                true,

        };


        this.records =
            new Map();

    }


    /*
    ======================================================
    Capture
    ======================================================
    */

    public capture(
        error: unknown,
        options:
            ErrorHandlerOptions = {},
    ): ErrorRecord {

        const handled =
            ErrorHandler.handle(
                error,
                {

                    ...options,

                    log:
                        options.log ??
                        this.options.log,

                    sanitize:
                        options.sanitize ??
                        this.options.sanitize,

                },
            );


        return this.register(
            handled,
        );

    }


    /*
    ======================================================
    Capture Without Logging
    ======================================================
    */

    public captureSilent(
        error: unknown,
        options:
            ErrorHandlerOptions = {},
    ): ErrorRecord {

        return this.capture(
            error,
            {

                ...options,

                log:
                    false,

            },
        );

    }


    /*
    ======================================================
    Create
    ======================================================
    */

    public create(
        message: string,
        options: Parameters<
            typeof ErrorFactory.create
        >[1] = {},
    ): ErrorRecord {

        const error =
            ErrorFactory.create(
                message,
                options,
            );


        return this.capture(
            error,
        );

    }


    /*
    ======================================================
    Create From Unknown
    ======================================================
    */

    public createFromUnknown(
        error: unknown,
        options:
            Parameters<
                typeof ErrorFactory.fromUnknown
            >[1] = {},
    ): ErrorRecord {

        const auraError =
            ErrorFactory.fromUnknown(
                error,
                options,
            );


        return this.capture(
            auraError,
        );

    }


    /*
    ======================================================
    Register
    ======================================================
    */

    private register(
        result: ErrorHandlerResult,
    ): ErrorRecord {

        const error =
            result.error;


        const context =
            this.prepareContext(
                result.context,
            );


        const fingerprint =
            this.createFingerprint(
                error,
                result.code,
                result.category,
                context,
            );


        if (
            this.options.deduplicate
        ) {

            const existing =
                this.records.get(
                    fingerprint,
                );


            if (
                existing
            ) {

                const updated =
                    this.updateOccurrence(
                        existing,
                    );


                this.records.set(
                    fingerprint,
                    updated,
                );


                return updated;

            }

        }


        const now =
            new Date().toISOString();


        const record: ErrorRecord = {

            id:
                this.generateId(),

            code:
                result.code,

            category:
                result.category,

            message:
                error.message,

            name:
                error.name,

            severity:
                error.severity,

            occurrences:
                1,

            firstSeenAt:
                now,

            lastSeenAt:
                now,

            status:
                "active",

            retryable:
                result.retryable,

            operational:
                result.operational,

            context,

            summary:
                summarizeErrorContext(
                    context,
                ),

        };


        this.records.set(
            fingerprint,
            record,
        );


        this.enforceLimit();


        return record;

    }


    /*
    ======================================================
    Update Occurrence
    ======================================================
    */

    private updateOccurrence(
        record: ErrorRecord,
    ): ErrorRecord {

        return {

            ...record,

            occurrences:
                record.occurrences + 1,

            lastSeenAt:
                new Date().toISOString(),

        };

    }


    /*
    ======================================================
    Prepare Context
    ======================================================
    */

    private prepareContext(
        context: ErrorContext,
    ): ErrorContext {

        if (
            !this.options.sanitize
        ) {

            return {
                ...context,
            };

        }


        return sanitizeErrorContext(
            context,
        );

    }


    /*
    ======================================================
    Fingerprint
    ======================================================
    */

    private createFingerprint(
        error: AURAError,
        code: ErrorCode | undefined,
        category: ErrorCategory,
        context: ErrorContext,
    ): string {

        const contextId =
            getErrorContextId(
                context,
            );


        const operation =
            context.operation ??
            "";


        const service =
            context.service ??
            "";


        const exchange =
            context.exchange ??
            "";


        const pair =
            context.pair ??
            "";


        const normalizedMessage =
            error.message
                .trim()
                .toLowerCase();


        return [

            code ?? "UNKNOWN",

            category,

            service,

            operation,

            exchange,

            pair,

            contextId,

            normalizedMessage,

        ].join(
            "|",
        );

    }


    /*
    ======================================================
    Generate ID
    ======================================================
    */

    private generateId(): string {

        this.sequence += 1;


        return [

            "err",

            Date.now().toString(
                36,
            ),

            this.sequence.toString(
                36,
            ),

        ].join(
            "-",
        );

    }


    /*
    ======================================================
    Enforce Limit
    ======================================================
    */

    private enforceLimit(): void {

        while (
            this.records.size >
            this.options.maxRecords
        ) {

            const first =
                this.records.keys().next().value;


            if (
                first === undefined
            ) {

                break;

            }


            this.records.delete(
                first,
            );

        }

    }


    /*
    ======================================================
    Get All
    ======================================================
    */

    public getAll(): readonly ErrorRecord[] {

        return Object.freeze(
            [
                ...this.records.values(),
            ],
        );

    }


    /*
    ======================================================
    Get By ID
    ======================================================
    */

    public getById(
        id: string,
    ): ErrorRecord | undefined {

        for (
            const record of
                this.records.values()
        ) {

            if (
                record.id === id
            ) {

                return record;

            }

        }


        return undefined;

    }


    /*
    ======================================================
    Find By Code
    ======================================================
    */

    public findByCode(
        code: ErrorCode,
    ): readonly ErrorRecord[] {

        return this.filter(
            record =>
                record.code === code,
        );

    }


    /*
    ======================================================
    Find By Category
    ======================================================
    */

    public findByCategory(
        category: ErrorCategory,
    ): readonly ErrorRecord[] {

        return this.filter(
            record =>
                record.category === category,
        );

    }


    /*
    ======================================================
    Find Active
    ======================================================
    */

    public getActive(): readonly ErrorRecord[] {

        return this.filter(
            record =>
                record.status === "active",
        );

    }


    /*
    ======================================================
    Find Acknowledged
    ======================================================
    */

    public getAcknowledged(): readonly ErrorRecord[] {

        return this.filter(
            record =>
                record.status === "acknowledged",
        );

    }


    /*
    ======================================================
    Find Resolved
    ======================================================
    */

    public getResolved(): readonly ErrorRecord[] {

        return this.filter(
            record =>
                record.status === "resolved",
        );

    }


    /*
    ======================================================
    Find
    ======================================================
    */

    public find(
        predicate:
            (
                record: ErrorRecord,
            ) => boolean,
    ): readonly ErrorRecord[] {

        return this.filter(
            predicate,
        );

    }


    /*
    ======================================================
    Filter
    ======================================================
    */

    private filter(
        predicate:
            (
                record: ErrorRecord,
            ) => boolean,
    ): readonly ErrorRecord[] {

        return Object.freeze(
            [
                ...this.records.values(),
            ].filter(
                predicate,
            ),
        );

    }


    /*
    ======================================================
    Acknowledge
    ======================================================
    */

    public acknowledge(
        id: string,
    ): ErrorRecord | undefined {

        return this.updateStatus(
            id,
            "acknowledged",
        );

    }


    /*
    ======================================================
    Resolve
    ======================================================
    */

    public resolve(
        id: string,
    ): ErrorRecord | undefined {

        return this.updateStatus(
            id,
            "resolved",
        );

    }


    /*
    ======================================================
    Ignore
    ======================================================
    */

    public ignore(
        id: string,
    ): ErrorRecord | undefined {

        return this.updateStatus(
            id,
            "ignored",
        );

    }


    /*
    ======================================================
    Reactivate
    ======================================================
    */

    public reactivate(
        id: string,
    ): ErrorRecord | undefined {

        return this.updateStatus(
            id,
            "active",
        );

    }


    /*
    ======================================================
    Update Status
    ======================================================
    */

    private updateStatus(
        id: string,
        status:
            ErrorLifecycleStatus,
    ): ErrorRecord | undefined {

        for (
            const [
                fingerprint,
                record,
            ]
            of this.records.entries()
        ) {

            if (
                record.id !== id
            ) {

                continue;

            }


            const updated: ErrorRecord = {

                ...record,

                status,

                lastSeenAt:
                    new Date().toISOString(),

            };


            this.records.set(
                fingerprint,
                updated,
            );


            return updated;

        }


        return undefined;

    }


    /*
    ======================================================
    Statistics
    ======================================================
    */

    public getStatistics(): ErrorStatistics {

        const records =
            this.getAll();


        const byCategory:
            Record<
                string,
                number
            > = {};


        const byCode:
            Record<
                string,
                number
            > = {};


        let active = 0;

        let acknowledged = 0;

        let resolved = 0;

        let ignored = 0;

        let retryable = 0;

        let critical = 0;

        let errors = 0;

        let warnings = 0;


        for (
            const record of records
        ) {

            const category =
                record.category;


            byCategory[category] =
                (
                    byCategory[category] ??
                    0
                ) +
                record.occurrences;


            if (
                record.code
            ) {

                byCode[
                    record.code
                ] =
                    (
                        byCode[
                            record.code
                        ] ??
                        0
                    ) +
                    record.occurrences;

            }


            switch (
                record.status
            ) {

                case "active":
                    active += 1;
                    break;

                case "acknowledged":
                    acknowledged += 1;
                    break;

                case "resolved":
                    resolved += 1;
                    break;

                case "ignored":
                    ignored += 1;
                    break;

            }


            if (
                record.retryable
            ) {

                retryable +=
                    record.occurrences;

            }


            if (
                record.severity ===
                "critical"
            ) {

                critical +=
                    record.occurrences;

            }


            if (
                record.severity ===
                "error"
            ) {

                errors +=
                    record.occurrences;

            }


            if (
                record.severity ===
                "warning"
            ) {

                warnings +=
                    record.occurrences;

            }

        }


        return {

            total:
                records.reduce(
                    (
                        total,
                        record,
                    ) =>
                        total +
                        record.occurrences,
                    0,
                ),

            active,

            acknowledged,

            resolved,

            ignored,

            retryable,

            critical,

            errors,

            warnings,

            byCategory:
                Object.freeze(
                    {
                        ...byCategory,
                    },
                ),

            byCode:
                Object.freeze(
                    {
                        ...byCode,
                    },
                ),

        };

    }


    /*
    ======================================================
    Has Active Errors
    ======================================================
    */

    public hasActiveErrors(): boolean {

        return this.getActive().length > 0;

    }


    /*
    ======================================================
    Has Critical Errors
    ======================================================
    */

    public hasCriticalErrors(): boolean {

        return this.getAll().some(
            record =>
                record.status === "active" &&
                record.severity === "critical",
        );

    }


    /*
    ======================================================
    Has Retryable Errors
    ======================================================
    */

    public hasRetryableErrors(): boolean {

        return this.getAll().some(
            record =>
                record.status === "active" &&
                record.retryable,
        );

    }


    /*
    ======================================================
    Latest
    ======================================================
    */

    public getLatest(): ErrorRecord | undefined {

        const records =
            this.getAll();


        return records.at(
            -1,
        );

    }


    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.records.clear();

    }


    /*
    ======================================================
    Clear Resolved
    ======================================================
    */

    public clearResolved(): number {

        let removed = 0;


        for (
            const [
                fingerprint,
                record,
            ]
            of this.records.entries()
        ) {

            if (
                record.status !==
                "resolved"
            ) {

                continue;

            }


            this.records.delete(
                fingerprint,
            );


            removed += 1;

        }


        return removed;

    }


    /*
    ======================================================
    Export
    ======================================================
    */

    public export(): readonly ErrorRecord[] {

        return this.getAll().map(
            record => ({

                ...record,

                context:
                    sanitizeErrorContext(
                        record.context,
                    ),

            }),
        );

    }


    /*
    ======================================================
    Health
    ======================================================
    */

    public getHealth(): ErrorManagerHealth {

        const statistics =
            this.getStatistics();


        let status:
            ErrorManagerHealthStatus =
                "healthy";


        if (
            statistics.critical >
            0 &&
            statistics.active >
            0
        ) {

            status =
                "critical";

        } else if (
            statistics.errors >
            0 &&
            statistics.active >
            0
        ) {

            status =
                "degraded";

        } else if (
            statistics.warnings >
            0 &&
            statistics.active >
            0
        ) {

            status =
                "warning";

        }


        return {

            status,

            activeErrors:
                statistics.active,

            criticalErrors:
                statistics.critical,

            retryableErrors:
                statistics.retryable,

            totalErrors:
                statistics.total,

        };

    }

}


/*
==========================================================
 Health Types
==========================================================
*/

export type ErrorManagerHealthStatus =
    | "healthy"
    | "warning"
    | "degraded"
    | "critical";


export interface ErrorManagerHealth {

    readonly status:
        ErrorManagerHealthStatus;

    readonly activeErrors: number;

    readonly criticalErrors: number;

    readonly retryableErrors: number;

    readonly totalErrors: number;

}


/*
==========================================================
 Singleton
==========================================================
*/

export const errorManager =
    new ErrorManager();


/*
==========================================================
 Functional API
==========================================================
*/

export function captureError(
    error: unknown,
    options:
        ErrorHandlerOptions = {},
): ErrorRecord {

    return errorManager.capture(
        error,
        options,
    );

}


export function acknowledgeError(
    id: string,
): ErrorRecord | undefined {

    return errorManager.acknowledge(
        id,
    );

}


export function resolveError(
    id: string,
): ErrorRecord | undefined {

    return errorManager.resolve(
        id,
    );

}


export function getErrorStatistics():
    ErrorStatistics {

    return errorManager.getStatistics();

}


export function getErrorHealth():
    ErrorManagerHealth {

    return errorManager.getHealth();

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorManager;
