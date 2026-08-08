/**
==========================================================
AURA Trade OS
Error Category
Version : 0.0.7 Alpha
==========================================================
Error Domain Classification
==========================================================
*/

import type {
    ErrorCode,
} from "./errorCode";


/*
==========================================================
Error Category
==========================================================
*/

export type ErrorCategory =

    /* System */
    | "system"
    | "runtime"
    | "configuration"

    /* Infrastructure */
    | "network"
    | "storage"
    | "serialization"
    | "telemetry"

    /* Application */
    | "validation"
    | "authentication"
    | "authorization"
    | "resource"

    /* Trading */
    | "exchange"
    | "market"
    | "order"
    | "portfolio"
    | "strategy"
    | "risk"

    /* Scheduling / Execution */
    | "scheduler"
    | "pipeline"
    | "plugin"

    /* Internal */
    | "internal"
    | "unknown";


/*
==========================================================
Category Metadata
==========================================================
*/

export interface ErrorCategoryMetadata {

    readonly category: ErrorCategory;

    readonly name: string;

    readonly description: string;

    readonly domain:
        | "system"
        | "infrastructure"
        | "application"
        | "trading"
        | "execution"
        | "internal";

}


/*
==========================================================
Category Definitions
==========================================================
*/

const CATEGORY_DEFINITIONS:
    Readonly<
        Record<
            ErrorCategory,
            ErrorCategoryMetadata
        >
    > = {

    /*
    ======================================================
    System
    ======================================================
    */

    system: {

        category: "system",

        name: "System Error",

        description:
            "General system-level failure.",

        domain: "system",

    },


    runtime: {

        category: "runtime",

        name: "Runtime Error",

        description:
            "Failure during application runtime execution.",

        domain: "system",

    },


    configuration: {

        category: "configuration",

        name: "Configuration Error",

        description:
            "Invalid, missing, or unsupported configuration.",

        domain: "system",

    },


    /*
    ======================================================
    Infrastructure
    ======================================================
    */

    network: {

        category: "network",

        name: "Network Error",

        description:
            "Network communication or connectivity failure.",

        domain: "infrastructure",

    },


    storage: {

        category: "storage",

        name: "Storage Error",

        description:
            "Persistent or temporary storage failure.",

        domain: "infrastructure",

    },


    serialization: {

        category: "serialization",

        name: "Serialization Error",

        description:
            "Serialization or deserialization failure.",

        domain: "infrastructure",

    },


    telemetry: {

        category: "telemetry",

        name: "Telemetry Error",

        description:
            "Telemetry collection, processing, or delivery failure.",

        domain: "infrastructure",

    },


    /*
    ======================================================
    Application
    ======================================================
    */

    validation: {

        category: "validation",

        name: "Validation Error",

        description:
            "Input, schema, or business-rule validation failure.",

        domain: "application",

    },


    authentication: {

        category: "authentication",

        name: "Authentication Error",

        description:
            "Authentication or credential verification failure.",

        domain: "application",

    },


    authorization: {

        category: "authorization",

        name: "Authorization Error",

        description:
            "Permission or access-control failure.",

        domain: "application",

    },


    resource: {

        category: "resource",

        name: "Resource Error",

        description:
            "Required application resource is unavailable or invalid.",

        domain: "application",

    },


    /*
    ======================================================
    Trading
    ======================================================
    */

    exchange: {

        category: "exchange",

        name: "Exchange Error",

        description:
            "Cryptocurrency exchange integration failure.",

        domain: "trading",

    },


    market: {

        category: "market",

        name: "Market Error",

        description:
            "Market data acquisition or processing failure.",

        domain: "trading",

    },


    order: {

        category: "order",

        name: "Order Error",

        description:
            "Trade order creation, submission, or execution failure.",

        domain: "trading",

    },


    portfolio: {

        category: "portfolio",

        name: "Portfolio Error",

        description:
            "Portfolio state or position management failure.",

        domain: "trading",

    },


    strategy: {

        category: "strategy",

        name: "Strategy Error",

        description:
            "Trading strategy execution or evaluation failure.",

        domain: "trading",

    },


    risk: {

        category: "risk",

        name: "Risk Error",

        description:
            "Risk evaluation, limits, or risk-engine failure.",

        domain: "trading",

    },


    /*
    ======================================================
    Scheduling / Execution
    ======================================================
    */

    scheduler: {

        category: "scheduler",

        name: "Scheduler Error",

        description:
            "Scheduled task creation, execution, or recovery failure.",

        domain: "execution",

    },


    pipeline: {

        category: "pipeline",

        name: "Pipeline Error",

        description:
            "Pipeline stage execution or orchestration failure.",

        domain: "execution",

    },


    plugin: {

        category: "plugin",

        name: "Plugin Error",

        description:
            "Plugin loading, validation, lifecycle, or execution failure.",

        domain: "execution",

    },


    /*
    ======================================================
    Internal
    ======================================================
    */

    internal: {

        category: "internal",

        name: "Internal Error",

        description:
            "Unexpected internal application failure.",

        domain: "internal",

    },


    unknown: {

        category: "unknown",

        name: "Unknown Error",

        description:
            "Error with an unknown or unclassified category.",

        domain: "internal",

    },

};


/*
==========================================================
Category Resolver
==========================================================
*/

export class ErrorCategoryResolver {

    /*
    ======================================================
    Resolve From Code
    ======================================================
    */

    public static fromCode(
        code: ErrorCode | string | undefined,
    ): ErrorCategory {

        if (
            !code
        ) {

            return "unknown";

        }


        const normalized =
            code.toUpperCase();


        /*
        ==================================================
        Configuration
        ==================================================
        */

        if (
            normalized.includes(
                "CONFIG",
            )
        ) {

            return "configuration";

        }


        /*
        ==================================================
        Validation
        ==================================================
        */

        if (
            normalized.includes(
                "VALIDATION",
            )
        )
        {

            return "validation";

        }


        /*
        ==================================================
        Authentication
        ==================================================
        */

        if (
            normalized.includes(
                "AUTHENTICATION",
            ) ||
            normalized.includes(
                "AUTH",
            )
        ) {

            return "authentication";

        }


        /*
        ==================================================
        Authorization
        ==================================================
        */

        if (
            normalized.includes(
                "AUTHORIZATION",
            ) ||
            normalized.includes(
                "FORBIDDEN",
            )
        ) {

            return "authorization";

        }


        /*
        ==================================================
        Network
        ==================================================
        */

        if (
            normalized.includes(
                "NETWORK",
            ) ||
            normalized.includes(
                "TIMEOUT",
            ) ||
            normalized.includes(
                "CONNECTION",
            )
        ) {

            return "network";

        }


        /*
        ==================================================
        Exchange
        ==================================================
        */

        if (
            normalized.includes(
                "EXCHANGE",
            ) ||
            normalized.includes(
                "INDODAX",
            )
        ) {

            return "exchange";

        }


        /*
        ==================================================
        Market
        ==================================================
        */

        if (
            normalized.includes(
                "MARKET",
            ) ||
            normalized.includes(
                "TICKER",
            ) ||
            normalized.includes(
                "CANDLE",
            ) ||
            normalized.includes(
                "OHLC",
            )
        ) {

            return "market";

        }


        /*
        ==================================================
        Order
        ==================================================
        */

        if (
            normalized.includes(
                "ORDER",
            ) ||
            normalized.includes(
                "TRADE",
            )
        ) {

            return "order";

        }


        /*
        ==================================================
        Portfolio
        ==================================================
        */

        if (
            normalized.includes(
                "PORTFOLIO",
            ) ||
            normalized.includes(
                "POSITION",
            )
        ) {

            return "portfolio";

        }


        /*
        ==================================================
        Strategy
        ==================================================
        */

        if (
            normalized.includes(
                "STRATEGY",
            ) ||
            normalized.includes(
                "SIGNAL",
            )
        ) {

            return "strategy";

        }


        /*
        ==================================================
        Risk
        ==================================================
        */

        if (
            normalized.includes(
                "RISK",
            ) ||
            normalized.includes(
                "LIMIT",
            )
        ) {

            return "risk";

        }


        /*
        ==================================================
        Scheduler
        ==================================================
        */

        if (
            normalized.includes(
                "SCHEDUL",
            ) ||
            normalized.includes(
                "CRON",
            )
        ) {

            return "scheduler";

        }


        /*
        ==================================================
        Pipeline
        ==================================================
        */

        if (
            normalized.includes(
                "PIPELINE",
            )
        ) {

            return "pipeline";

        }


        /*
        ==================================================
        Plugin
        ==================================================
        */

        if (
            normalized.includes(
                "PLUGIN",
            )
        ) {

            return "plugin";

        }


        /*
        ==================================================
        Serialization
        ==================================================
        */

        if (
            normalized.includes(
                "SERIAL",
            )
        ) {

            return "serialization";

        }


        /*
        ==================================================
        Storage
        ==================================================
        */

        if (
            normalized.includes(
                "STORAGE",
            ) ||
            normalized.includes(
                "DATABASE",
            ) ||
            normalized.includes(
                "PERSIST",
            )
        ) {

            return "storage";

        }


        /*
        ==================================================
        Telemetry
        ==================================================
        */

        if (
            normalized.includes(
                "TELEMETRY",
            ) ||
            normalized.includes(
                "METRIC",
            )
        ) {

            return "telemetry";

        }


        /*
        ==================================================
        Runtime
        ==================================================
        */

        if (
            normalized.includes(
                "RUNTIME",
            ) ||
            normalized.includes(
                "EXECUTION",
            )
        ) {

            return "runtime";

        }


        /*
        ==================================================
        Internal
        ==================================================
        */

        if (
            normalized.includes(
                "INTERNAL",
            )
        ) {

            return "internal";

        }


        return "unknown";

    }


    /*
    ======================================================
    Get Metadata
    ======================================================
    */

    public static metadata(
        category: ErrorCategory,
    ): ErrorCategoryMetadata {

        return CATEGORY_DEFINITIONS[
            category
        ];

    }


    /*
    ======================================================
    Is Known Category
    ======================================================
    */

    public static isKnown(
        category: string,
    ): category is ErrorCategory {

        return (
            Object.prototype.hasOwnProperty.call(
                CATEGORY_DEFINITIONS,
                category,
            )
        );

    }


    /*
    ======================================================
    Normalize
    ======================================================
    */

    public static normalize(
        category:
            ErrorCategory |
            string |
            undefined,
    ): ErrorCategory {

        if (
            !category
        ) {

            return "unknown";

        }


        const normalized =
            category.toLowerCase() as ErrorCategory;


        if (
            this.isKnown(
                normalized,
            )
        ) {

            return normalized;

        }


        return "unknown";

    }

}


/*
==========================================================
Helper Functions
==========================================================
*/

export function getErrorCategory(
    code?: ErrorCode | string,
): ErrorCategory {

    return ErrorCategoryResolver.fromCode(
        code,
    );

}


export function getErrorCategoryMetadata(
    category: ErrorCategory,
): ErrorCategoryMetadata {

    return ErrorCategoryResolver.metadata(
        category,
    );

}


export function isErrorCategory(
    value: string,
): value is ErrorCategory {

    return ErrorCategoryResolver.isKnown(
        value,
    );

}


/*
==========================================================
Category Constants
==========================================================
*/

export const ERROR_CATEGORIES =
    Object.freeze({

        SYSTEM:
            "system" as ErrorCategory,

        RUNTIME:
            "runtime" as ErrorCategory,

        CONFIGURATION:
            "configuration" as ErrorCategory,

        NETWORK:
            "network" as ErrorCategory,

        STORAGE:
            "storage" as ErrorCategory,

        SERIALIZATION:
            "serialization" as ErrorCategory,

        TELEMETRY:
            "telemetry" as ErrorCategory,

        VALIDATION:
            "validation" as ErrorCategory,

        AUTHENTICATION:
            "authentication" as ErrorCategory,

        AUTHORIZATION:
            "authorization" as ErrorCategory,

        RESOURCE:
            "resource" as ErrorCategory,

        EXCHANGE:
            "exchange" as ErrorCategory,

        MARKET:
            "market" as ErrorCategory,

        ORDER:
            "order" as ErrorCategory,

        PORTFOLIO:
            "portfolio" as ErrorCategory,

        STRATEGY:
            "strategy" as ErrorCategory,

        RISK:
            "risk" as ErrorCategory,

        SCHEDULER:
            "scheduler" as ErrorCategory,

        PIPELINE:
            "pipeline" as ErrorCategory,

        PLUGIN:
            "plugin" as ErrorCategory,

        INTERNAL:
            "internal" as ErrorCategory,

        UNKNOWN:
            "unknown" as ErrorCategory,

    } as const);
