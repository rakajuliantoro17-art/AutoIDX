/**
==========================================================
AURA Trade OS
Error Registry
Version : 0.0.7 Alpha
==========================================================
Centralized Error Definition Registry
==========================================================
*/

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
    ErrorMetadata,
} from "./errorMetadata";

import {
    createErrorMetadata,
    mergeErrorMetadata,
} from "./errorMetadata";


/*
==========================================================
 Error Definition
==========================================================
*/

export interface ErrorDefinition {

    /**
     * Stable error code.
     */
    readonly code:
        ErrorCode;

    /**
     * Human-readable title.
     */
    readonly title:
        string;

    /**
     * Error category.
     */
    readonly category:
        ErrorCategory;

    /**
     * Default error message.
     */
    readonly message:
        string;

    /**
     * Error description.
     */
    readonly description?:
        string;

    /**
     * Default severity.
     */
    readonly severity?:
        string;

    /**
     * Whether this error can be retried.
     */
    readonly retryable:
        boolean;

    /**
     * Whether this error is operational.
     */
    readonly operational:
        boolean;

    /**
     * Whether this error should be reported.
     */
    readonly reportable:
        boolean;

    /**
     * Additional structured metadata.
     */
    readonly metadata?:
        ErrorMetadata;

}


/*
==========================================================
 Registration Options
==========================================================
*/

export interface ErrorRegistrationOptions {

    /**
     * Override title.
     */
    readonly title?:
        string;

    /**
     * Override category.
     */
    readonly category?:
        ErrorCategory;

    /**
     * Override default message.
     */
    readonly message?:
        string;

    /**
     * Error description.
     */
    readonly description?:
        string;

    /**
     * Error severity.
     */
    readonly severity?:
        string;

    /**
     * Whether retry is allowed.
     */
    readonly retryable?:
        boolean;

    /**
     * Whether the error is operational.
     */
    readonly operational?:
        boolean;

    /**
     * Whether the error should be reported.
     */
    readonly reportable?:
        boolean;

    /**
     * Additional metadata.
     */
    readonly metadata?:
        ErrorMetadata;

}


/*
==========================================================
 Registry Statistics
==========================================================
*/

export interface ErrorRegistryStatistics {

    /**
     * Number of registered definitions.
     */
    readonly total:
        number;

    /**
     * Number of retryable definitions.
     */
    readonly retryable:
        number;

    /**
     * Number of non-retryable definitions.
     */
    readonly nonRetryable:
        number;

    /**
     * Definitions grouped by category.
     */
    readonly byCategory:
        Readonly<
            Record<
                string,
                number
            >
        >;

}


/*
==========================================================
 Registry
==========================================================
*/

export class ErrorRegistry {

    /*
    ======================================================
    Internal Definitions
    ======================================================
    */

    private readonly definitions:
        Map<
            ErrorCode,
            ErrorDefinition
        >;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor() {

        this.definitions =
            new Map();

    }


    /*
    ======================================================
    Register
    ======================================================
    */

    public register(
        code:
            ErrorCode,
        options:
            ErrorRegistrationOptions = {},
    ): ErrorDefinition {

        const existing =
            this.definitions.get(
                code,
            );


        if (
            existing
        ) {

            return this.update(
                code,
                options,
            ) as ErrorDefinition;

        }


        const definition =
            this.buildDefinition(
                code,
                options,
            );


        this.definitions.set(
            code,
            definition,
        );


        return definition;

    }


    /*
    ======================================================
    Register Definition
    ======================================================
    */

    public registerDefinition(
        definition:
            ErrorDefinition,
    ): ErrorDefinition {

        this.definitions.set(
            definition.code,
            Object.freeze({
                ...definition,
            }),
        );


        return this.definitions.get(
            definition.code,
        ) as ErrorDefinition;

    }


    /*
    ======================================================
    Build Definition
    ======================================================
    */

    private buildDefinition(
        code:
            ErrorCode,
        options:
            ErrorRegistrationOptions,
    ): ErrorDefinition {

        const codeMetadata =
            getErrorCodeMetadata(
                code,
            );


        const category =
            options.category ??
            this.resolveCategory(
                code,
                codeMetadata?.category,
            );


        const metadata =
            createErrorMetadata({

                ...(codeMetadata ?? {}),

                ...(options.metadata ?? {}),

                code,

                category,

                title:
                    options.title ??
                    codeMetadata?.title,

                summary:
                    options.description ??
                    codeMetadata?.summary,

                retryable:
                    options.retryable ??
                    codeMetadata?.retryable,

                operational:
                    options.operational ??
                    codeMetadata?.operational,

                reportable:
                    options.reportable ??
                    codeMetadata?.reportable,

            });


        const definition: ErrorDefinition = {

            code,

            title:
                options.title ??
                codeMetadata?.title ??
                code,

            category,

            message:
                options.message ??
                codeMetadata?.message ??
                "AURA Trade OS error",

            description:
                options.description ??
                codeMetadata?.description,

            severity:
                options.severity ??
                codeMetadata?.severity ??
                metadata.telemetrySeverity ??
                "error",

            retryable:
                options.retryable ??
                codeMetadata?.retryable ??
                metadata.retryable ??
                false,

            operational:
                options.operational ??
                codeMetadata?.operational ??
                metadata.operational ??
                true,

            reportable:
                options.reportable ??
                codeMetadata?.reportable ??
                metadata.reportable ??
                true,

            metadata,

        };


        return Object.freeze(
            definition,
        );

    }


    /*
    ======================================================
    Resolve Category
    ======================================================
    */

    private resolveCategory(
        code:
            ErrorCode,
        fallback:
            ErrorCategory |
            undefined,
    ): ErrorCategory {

        if (
            fallback
        ) {

            return fallback;

        }


        return ErrorCategoryResolver.fromCode(
            code,
        );

    }


    /*
    ======================================================
    Get
    ======================================================
    */

    public get(
        code:
            ErrorCode,
    ): ErrorDefinition | undefined {

        return this.definitions.get(
            code,
        );

    }


    /*
    ======================================================
    Require
    ======================================================
    */

    public require(
        code:
            ErrorCode,
    ): ErrorDefinition {

        const definition =
            this.get(
                code,
            );


        if (
            definition
        ) {

            return definition;

        }


        return this.register(
            code,
        );

    }


    /*
    ======================================================
    Has
    ======================================================
    */

    public has(
        code:
            ErrorCode,
    ): boolean {

        return this.definitions.has(
            code,
        );

    }


    /*
    ======================================================
    Update
    ======================================================
    */

    public update(
        code:
            ErrorCode,
        options:
            ErrorRegistrationOptions,
    ): ErrorDefinition | undefined {

        const existing =
            this.definitions.get(
                code,
            );


        if (
            !existing
        ) {

            return this.register(
                code,
                options,
            );

        }


        const mergedMetadata =
            mergeErrorMetadata(
                existing.metadata,
                options.metadata,
            );


        const updated: ErrorDefinition = {

            ...existing,

            title:
                options.title ??
                existing.title,

            category:
                options.category ??
                existing.category,

            message:
                options.message ??
                existing.message,

            description:
                options.description ??
                existing.description,

            severity:
                options.severity ??
                existing.severity,

            retryable:
                options.retryable ??
                existing.retryable,

            operational:
                options.operational ??
                existing.operational,

            reportable:
                options.reportable ??
                existing.reportable,

            metadata:
                mergedMetadata,

        };


        this.definitions.set(
            code,
            Object.freeze(
                updated,
            ),
        );


        return this.definitions.get(
            code,
        );

    }


    /*
    ======================================================
    Remove
    ======================================================
    */

    public remove(
        code:
            ErrorCode,
    ): boolean {

        return this.definitions.delete(
            code,
        );

    }


    /*
    ======================================================
    Get All
    ======================================================
    */

    public getAll():
        readonly ErrorDefinition[] {

        return Object.freeze(
            [
                ...this.definitions.values(),
            ],
        );

    }


    /*
    ======================================================
    Get Codes
    ======================================================
    */

    public getCodes():
        readonly ErrorCode[] {

        return Object.freeze(
            [
                ...this.definitions.keys(),
            ],
        );

    }


    /*
    ======================================================
    Find By Category
    ======================================================
    */

    public findByCategory(
        category:
            ErrorCategory,
    ):
        readonly ErrorDefinition[] {

        return Object.freeze(
            [
                ...this.definitions.values(),
            ].filter(
                definition =>
                    definition.category ===
                    category,
            ),
        );

    }


    /*
    ======================================================
    Find Retryable
    ======================================================
    */

    public findRetryable():
        readonly ErrorDefinition[] {

        return Object.freeze(
            [
                ...this.definitions.values(),
            ].filter(
                definition =>
                    definition.retryable,
            ),
        );

    }


    /*
    ======================================================
    Find Non-Retryable
    ======================================================
    */

    public findNonRetryable():
        readonly ErrorDefinition[] {

        return Object.freeze(
            [
                ...this.definitions.values(),
            ].filter(
                definition =>
                    !definition.retryable,
            ),
        );

    }


    /*
    ======================================================
    Find By Severity
    ======================================================
    */

    public findBySeverity(
        severity:
            string,
    ):
        readonly ErrorDefinition[] {

        return Object.freeze(
            [
                ...this.definitions.values(),
            ].filter(
                definition =>
                    definition.severity ===
                    severity,
            ),
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
                definition:
                    ErrorDefinition,
            ) => boolean,
    ):
        readonly ErrorDefinition[] {

        return Object.freeze(
            [
                ...this.definitions.values(),
            ].filter(
                predicate,
            ),
        );

    }


    /*
    ======================================================
    Resolve Metadata
    ======================================================
    */

    public resolveMetadata(
        code:
            ErrorCode,
    ):
        ErrorMetadata | undefined {

        return this.get(
            code,
        )?.metadata;

    }


    /*
    ======================================================
    Resolve Message
    ======================================================
    */

    public resolveMessage(
        code:
            ErrorCode,
    ): string {

        return this.get(
            code,
        )?.message ??
            "AURA Trade OS error";

    }


    /*
    ======================================================
    Resolve Category
    ======================================================
    */

    public resolveErrorCategory(
        code:
            ErrorCode,
    ): ErrorCategory {

        const definition =
            this.get(
                code,
            );


        if (
            definition
        ) {

            return definition.category;

        }


        return ErrorCategoryResolver.fromCode(
            code,
        );

    }


    /*
    ======================================================
    Resolve Retryability
    ======================================================
    */

    public isRetryable(
        code:
            ErrorCode,
    ): boolean {

        return Boolean(
            this.get(
                code,
            )?.retryable ??
            getErrorCodeMetadata(
                code,
            )?.retryable,
        );

    }


    /*
    ======================================================
    Resolve Severity
    ======================================================
    */

    public resolveSeverity(
        code:
            ErrorCode,
    ): string {

        return (
            this.get(
                code,
            )?.severity ??
            getErrorCodeMetadata(
                code,
            )?.severity ??
            "error"
        );

    }


    /*
    ======================================================
    Statistics
    ======================================================
    */

    public getStatistics():
        ErrorRegistryStatistics {

        const byCategory:
            Record<
                string,
                number
            > = {};


        let retryable = 0;


        for (
            const definition
                of this.definitions.values()
        ) {

            const category =
                definition.category;


            byCategory[category] =
                (
                    byCategory[category] ??
                    0
                ) + 1;


            if (
                definition.retryable
            ) {

                retryable += 1;

            }

        }


        const total =
            this.definitions.size;


        return {

            total,

            retryable,

            nonRetryable:
                total -
                retryable,

            byCategory:
                Object.freeze({
                    ...byCategory,
                }),

        };

    }


    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.definitions.clear();

    }


    /*
    ======================================================
    Clone
    ======================================================
    */

    public clone():
        ErrorRegistry {

        const registry =
            new ErrorRegistry();


        for (
            const definition
                of this.definitions.values()
        ) {

            registry.registerDefinition(
                definition,
            );

        }


        return registry;

    }

}


/*
==========================================================
 Singleton Registry
==========================================================
*/

export const errorRegistry =
    new ErrorRegistry();


/*
==========================================================
 Functional API
==========================================================
*/

export function registerErrorDefinition(
    code:
        ErrorCode,
    options:
        ErrorRegistrationOptions = {},
): ErrorDefinition {

    return errorRegistry.register(
        code,
        options,
    );

}


/*
==========================================================
 Get Error Definition
==========================================================
*/

export function getErrorDefinition(
    code:
        ErrorCode,
): ErrorDefinition | undefined {

    return errorRegistry.get(
        code,
    );

}


/*
==========================================================
 Require Error Definition
==========================================================
*/

export function requireErrorDefinition(
    code:
        ErrorCode,
): ErrorDefinition {

    return errorRegistry.require(
        code,
    );

}


/*
==========================================================
 Check Error Definition
==========================================================
*/

export function hasErrorDefinition(
    code:
        ErrorCode,
): boolean {

    return errorRegistry.has(
        code,
    );

}


/*
==========================================================
 Remove Error Definition
==========================================================
*/

export function unregisterErrorDefinition(
    code:
        ErrorCode,
): boolean {

    return errorRegistry.remove(
        code,
    );

}


/*
==========================================================
 Registry Statistics
==========================================================
*/

export function getErrorRegistryStatistics():
    ErrorRegistryStatistics {

    return errorRegistry.getStatistics();

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorRegistry;
