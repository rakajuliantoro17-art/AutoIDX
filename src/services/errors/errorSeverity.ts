/**
==========================================================
AURA Trade OS
Error Severity
Version : 0.0.7 Alpha
==========================================================
Centralized Error Severity Model
==========================================================
*/


/*
==========================================================
 Error Severity
==========================================================
*/

export enum ErrorSeverity {

    /**
     * Informational event.
     *
     * Tidak menunjukkan kegagalan.
     */
    INFO = "info",

    /**
     * Recoverable warning.
     *
     * Sistem masih dapat berjalan.
     */
    WARNING = "warning",

    /**
     * Normal application error.
     *
     * Operasi tertentu gagal tetapi sistem
     * secara keseluruhan masih dapat berjalan.
     */
    ERROR = "error",

    /**
     * Serious operational failure.
     *
     * Membutuhkan perhatian lebih lanjut.
     */
    CRITICAL = "critical",

    /**
     * Catastrophic failure.
     *
     * Dapat menyebabkan service/system berhenti.
     */
    FATAL = "fatal",

}


/*
==========================================================
 Severity Numeric Weight
==========================================================
*/

export const ERROR_SEVERITY_WEIGHT:
    Readonly<
        Record<
            ErrorSeverity,
            number
        >
    > = Object.freeze({

        [ErrorSeverity.INFO]:
            10,

        [ErrorSeverity.WARNING]:
            20,

        [ErrorSeverity.ERROR]:
            30,

        [ErrorSeverity.CRITICAL]:
            40,

        [ErrorSeverity.FATAL]:
            50,

    });


/*
==========================================================
 Severity Priority
==========================================================
*/

export interface ErrorSeverityPriority {

    readonly severity:
        ErrorSeverity;

    readonly weight:
        number;

    readonly rank:
        number;

    readonly requiresAttention:
        boolean;

    readonly requiresRecovery:
        boolean;

    readonly requiresAlert:
        boolean;

}


/*
==========================================================
 Severity Policy
==========================================================
*/

export interface ErrorSeverityPolicy {

    readonly severity:
        ErrorSeverity;

    readonly minimumLogLevel:
        ErrorSeverity;

    readonly notify:
        boolean;

    readonly alert:
        boolean;

    readonly recover:
        boolean;

    readonly stopExecution:
        boolean;

    readonly stopService:
        boolean;

}


/*
==========================================================
 Default Severity Policies
==========================================================
*/

export const ERROR_SEVERITY_POLICIES:
    Readonly<
        Record<
            ErrorSeverity,
            ErrorSeverityPolicy
        >
    > = Object.freeze({

        [ErrorSeverity.INFO]: Object.freeze({

            severity:
                ErrorSeverity.INFO,

            minimumLogLevel:
                ErrorSeverity.INFO,

            notify:
                false,

            alert:
                false,

            recover:
                false,

            stopExecution:
                false,

            stopService:
                false,

        }),

        [ErrorSeverity.WARNING]: Object.freeze({

            severity:
                ErrorSeverity.WARNING,

            minimumLogLevel:
                ErrorSeverity.WARNING,

            notify:
                false,

            alert:
                false,

            recover:
                true,

            stopExecution:
                false,

            stopService:
                false,

        }),

        [ErrorSeverity.ERROR]: Object.freeze({

            severity:
                ErrorSeverity.ERROR,

            minimumLogLevel:
                ErrorSeverity.ERROR,

            notify:
                false,

            alert:
                false,

            recover:
                true,

            stopExecution:
                false,

            stopService:
                false,

        }),

        [ErrorSeverity.CRITICAL]: Object.freeze({

            severity:
                ErrorSeverity.CRITICAL,

            minimumLogLevel:
                ErrorSeverity.CRITICAL,

            notify:
                true,

            alert:
                true,

            recover:
                true,

            stopExecution:
                true,

            stopService:
                false,

        }),

        [ErrorSeverity.FATAL]: Object.freeze({

            severity:
                ErrorSeverity.FATAL,

            minimumLogLevel:
                ErrorSeverity.FATAL,

            notify:
                true,

            alert:
                true,

            recover:
                false,

            stopExecution:
                true,

            stopService:
                true,

        }),

    });


/*
==========================================================
 Normalize Severity
==========================================================
*/

export function normalizeErrorSeverity(
    value:
        unknown,
): ErrorSeverity {

    if (
        typeof value === "string" &&
        (Object.values(ErrorSeverity) as string[]).includes(value)
    ) {

        return value as ErrorSeverity;

    }


    if (
        typeof value !==
        "string"
    ) {

        return ErrorSeverity.ERROR;

    }


    const normalized =
        value
            .trim()
            .toLowerCase();


    switch (
        normalized
    ) {

        case "info":

        case "information":

        case "informational":

            return ErrorSeverity.INFO;


        case "warn":

        case "warning":

            return ErrorSeverity.WARNING;


        case "err":

        case "error":

            return ErrorSeverity.ERROR;


        case "critical":

        case "crit":

            return ErrorSeverity.CRITICAL;


        case "fatal":

        case "emergency":

        case "emerg":

            return ErrorSeverity.FATAL;


        default:

            return ErrorSeverity.ERROR;

    }

}


/*
==========================================================
 Get Severity Weight
==========================================================
*/

export function getErrorSeverityWeight(
    severity:
        ErrorSeverity |
        string,
): number {

    const normalized =
        normalizeErrorSeverity(
            severity,
        );


    return ERROR_SEVERITY_WEIGHT[
        normalized
    ];

}


/*
==========================================================
 Compare Severity
==========================================================
*/

export function compareErrorSeverity(
    left:
        ErrorSeverity |
        string,

    right:
        ErrorSeverity |
        string,
): number {

    const leftWeight =
        getErrorSeverityWeight(
            left,
        );


    const rightWeight =
        getErrorSeverityWeight(
            right,
        );


    return (
        leftWeight -
        rightWeight
    );

}


/*
==========================================================
 Is More Severe
==========================================================
*/

export function isMoreSevere(
    left:
        ErrorSeverity |
        string,

    right:
        ErrorSeverity |
        string,
): boolean {

    return (
        compareErrorSeverity(
            left,
            right,
        ) > 0
    );

}


/*
==========================================================
 Is Less Severe
==========================================================
*/

export function isLessSevere(
    left:
        ErrorSeverity |
        string,

    right:
        ErrorSeverity |
        string,
): boolean {

    return (
        compareErrorSeverity(
            left,
            right,
        ) < 0
    );

}


/*
==========================================================
 Is At Least
==========================================================
*/

export function isSeverityAtLeast(
    severity:
        ErrorSeverity |
        string,

    minimum:
        ErrorSeverity |
        string,
): boolean {

    return (
        compareErrorSeverity(
            severity,
            minimum,
        ) >= 0
    );

}


/*
==========================================================
 Is At Most
==========================================================
*/

export function isSeverityAtMost(
    severity:
        ErrorSeverity |
        string,

    maximum:
        ErrorSeverity |
        string,
): boolean {

    return (
        compareErrorSeverity(
            severity,
            maximum,
        ) <= 0
    );

}


/*
==========================================================
 Get Policy
==========================================================
*/

export function getErrorSeverityPolicy(
    severity:
        ErrorSeverity |
        string,
): ErrorSeverityPolicy {

    const normalized =
        normalizeErrorSeverity(
            severity,
        );


    return ERROR_SEVERITY_POLICIES[
        normalized
    ];

}


/*
==========================================================
 Get Priority
==========================================================
*/

export function getErrorSeverityPriority(
    severity:
        ErrorSeverity |
        string,
): ErrorSeverityPriority {

    const normalized =
        normalizeErrorSeverity(
            severity,
        );


    const weight =
        ERROR_SEVERITY_WEIGHT[
            normalized
        ];


    return {

        severity:
            normalized,

        weight,

        rank:
            Math.floor(
                weight / 10,
            ),

        requiresAttention:
            weight >=
            ERROR_SEVERITY_WEIGHT[
                ErrorSeverity.ERROR
            ],

        requiresRecovery:
            ERROR_SEVERITY_POLICIES[
                normalized
            ].recover,

        requiresAlert:
            ERROR_SEVERITY_POLICIES[
                normalized
            ].alert,

    };

}


/*
==========================================================
 Is Recoverable Severity
==========================================================
*/

export function isRecoverableSeverity(
    severity:
        ErrorSeverity |
        string,
): boolean {

    return getErrorSeverityPolicy(
        severity,
    ).recover;

}


/*
==========================================================
 Requires Alert
==========================================================
*/

export function requiresErrorAlert(
    severity:
        ErrorSeverity |
        string,
): boolean {

    return getErrorSeverityPolicy(
        severity,
    ).alert;

}


/*
==========================================================
 Requires Notification
==========================================================
*/

export function requiresErrorNotification(
    severity:
        ErrorSeverity |
        string,
): boolean {

    return getErrorSeverityPolicy(
        severity,
    ).notify;

}


/*
==========================================================
 Requires Execution Stop
==========================================================
*/

export function requiresExecutionStop(
    severity:
        ErrorSeverity |
        string,
): boolean {

    return getErrorSeverityPolicy(
        severity,
    ).stopExecution;

}


/*
==========================================================
 Requires Service Stop
==========================================================
*/

export function requiresServiceStop(
    severity:
        ErrorSeverity |
        string,
): boolean {

    return getErrorSeverityPolicy(
        severity,
    ).stopService;

}


/*
==========================================================
 Severity Label
==========================================================
*/

export function getErrorSeverityLabel(
    severity:
        ErrorSeverity |
        string,
): string {

    const normalized =
        normalizeErrorSeverity(
            severity,
        );


    switch (
        normalized
    ) {

        case ErrorSeverity.INFO:

            return "INFO";


        case ErrorSeverity.WARNING:

            return "WARNING";


        case ErrorSeverity.ERROR:

            return "ERROR";


        case ErrorSeverity.CRITICAL:

            return "CRITICAL";


        case ErrorSeverity.FATAL:

            return "FATAL";


        default:

            return "ERROR";

    }

}


/*
==========================================================
 Severity Description
==========================================================
*/

export function getErrorSeverityDescription(
    severity:
        ErrorSeverity |
        string,
): string {

    const normalized =
        normalizeErrorSeverity(
            severity,
        );


    switch (
        normalized
    ) {

        case ErrorSeverity.INFO:

            return (
                "Informational event that " +
                "does not indicate a failure."
            );


        case ErrorSeverity.WARNING:

            return (
                "Recoverable condition that " +
                "may require attention."
            );


        case ErrorSeverity.ERROR:

            return (
                "Operational error affecting " +
                "a specific operation."
            );


        case ErrorSeverity.CRITICAL:

            return (
                "Serious failure requiring " +
                "immediate attention or recovery."
            );


        case ErrorSeverity.FATAL:

            return (
                "Catastrophic failure that may " +
                "require service termination."
            );


        default:

            return (
                "Unknown error severity."
            );

    }

}


/*
==========================================================
 Escalate Severity
==========================================================
*/

export function escalateErrorSeverity(
    severity:
        ErrorSeverity |
        string,
    levels:
        number = 1,
): ErrorSeverity {

    const normalized =
        normalizeErrorSeverity(
            severity,
        );


    if (
        levels <= 0
    ) {

        return normalized;

    }


    const currentWeight =
        getErrorSeverityWeight(
            normalized,
        );


    const targetWeight =
        Math.min(
            ErrorSeverityWeightMax,
            currentWeight +
                (
                    levels * 10
                ),
        );


    return severityFromWeight(
        targetWeight,
    );

}


/*
==========================================================
 De-escalate Severity
==========================================================
*/

export function deescalateErrorSeverity(
    severity:
        ErrorSeverity |
        string,
    levels:
        number = 1,
): ErrorSeverity {

    const normalized =
        normalizeErrorSeverity(
            severity,
        );


    if (
        levels <= 0
    ) {

        return normalized;

    }


    const currentWeight =
        getErrorSeverityWeight(
            normalized,
        );


    const targetWeight =
        Math.max(
            ErrorSeverityWeightMin,
            currentWeight -
                (
                    levels * 10
                ),
        );


    return severityFromWeight(
        targetWeight,
    );

}


/*
==========================================================
 Max Severity
==========================================================
*/

export function maxErrorSeverity(
    ...severities:
        Array<
            ErrorSeverity |
            string
        >
): ErrorSeverity {

    if (
        severities.length === 0
    ) {

        return ErrorSeverity.INFO;

    }


    return severities.reduce(
        (
            highest,
            current,
        ) => {

            return isMoreSevere(
                current,
                highest,
            )
                ? normalizeErrorSeverity(
                    current,
                )
                : highest;

        },
        ErrorSeverity.INFO,
    );

}


/*
==========================================================
 Min Severity
==========================================================
*/

export function minErrorSeverity(
    ...severities:
        Array<
            ErrorSeverity |
            string
        >
): ErrorSeverity {

    if (
        severities.length === 0
    ) {

        return ErrorSeverity.INFO;

    }


    return severities.reduce(
        (
            lowest,
            current,
        ) => {

            return isLessSevere(
                current,
                lowest,
            )
                ? normalizeErrorSeverity(
                    current,
                )
                : lowest;

        },
        ErrorSeverity.FATAL,
    );

}


/*
==========================================================
 Severity From Weight
==========================================================
*/

const ErrorSeverityWeightMin =
    ERROR_SEVERITY_WEIGHT[
        ErrorSeverity.INFO
    ];

const ErrorSeverityWeightMax =
    ERROR_SEVERITY_WEIGHT[
        ErrorSeverity.FATAL
    ];


export function severityFromWeight(
    weight:
        number,
): ErrorSeverity {

    if (
        weight <=
        ErrorSeverityWeightMin
    ) {

        return ErrorSeverity.INFO;

    }


    if (
        weight <=
        ERROR_SEVERITY_WEIGHT[
            ErrorSeverity.WARNING
        ]
    ) {

        return ErrorSeverity.WARNING;

    }


    if (
        weight <=
        ERROR_SEVERITY_WEIGHT[
            ErrorSeverity.ERROR
        ]
    ) {

        return ErrorSeverity.ERROR;

    }


    if (
        weight <=
        ERROR_SEVERITY_WEIGHT[
            ErrorSeverity.CRITICAL
        ]
    ) {

        return ErrorSeverity.CRITICAL;

    }


    return ErrorSeverity.FATAL;

}


/*
==========================================================
 Severity From Rank
==========================================================
*/

export function severityFromRank(
    rank:
        number,
): ErrorSeverity {

    return severityFromWeight(
        rank * 10,
    );

}


/*
==========================================================
 Severity List
==========================================================
*/

export function getAllErrorSeverities():
    readonly ErrorSeverity[] {

    return Object.freeze(
        [
            ErrorSeverity.INFO,
            ErrorSeverity.WARNING,
            ErrorSeverity.ERROR,
            ErrorSeverity.CRITICAL,
            ErrorSeverity.FATAL,
        ],
    );

}


/*
==========================================================
 Severity Validation
==========================================================
*/

export function isValidErrorSeverity(
    value:
        unknown,
): value is ErrorSeverity {

    if (
        typeof value !==
        "string"
    ) {

        return false;

    }


    const normalized =
        value
            .trim()
            .toLowerCase();


    return (
        normalized ===
            ErrorSeverity.INFO ||
        normalized ===
            ErrorSeverity.WARNING ||
        normalized ===
            ErrorSeverity.ERROR ||
        normalized ===
            ErrorSeverity.CRITICAL ||
        normalized ===
            ErrorSeverity.FATAL
    );

}


/*
==========================================================
 Default Severity
==========================================================
*/

export const DEFAULT_ERROR_SEVERITY:
    ErrorSeverity =
        ErrorSeverity.ERROR;


/*
==========================================================
 Highest Alert Severity
==========================================================
*/

export const ERROR_ALERT_THRESHOLD:
    ErrorSeverity =
        ErrorSeverity.CRITICAL;


/*
==========================================================
 Highest Recovery Severity
==========================================================
*/

export const ERROR_RECOVERY_THRESHOLD:
    ErrorSeverity =
        ErrorSeverity.WARNING;


/*
==========================================================
 Critical Severity Check
==========================================================
*/

export function isCriticalErrorSeverity(
    severity:
        ErrorSeverity |
        string,
): boolean {

    return isSeverityAtLeast(
        severity,
        ErrorSeverity.CRITICAL,
    );

}


/*
==========================================================
 Fatal Severity Check
==========================================================
*/

export function isFatalErrorSeverity(
    severity:
        ErrorSeverity |
        string,
): boolean {

    return (
        normalizeErrorSeverity(
            severity,
        ) ===
        ErrorSeverity.FATAL
    );

}


/*
==========================================================
 Default Export
==========================================================
*/

export default ErrorSeverity;
