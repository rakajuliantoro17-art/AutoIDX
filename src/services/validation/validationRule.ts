/**
==========================================================
AURA Trade OS
Validation Rule
Version : 0.0.7 Alpha
==========================================================
Validation Rule Definition & Utilities
==========================================================
*/

import type {
    ValidationContext,
} from "./validationContext";

import type {
    ValidationIssue,
} from "./validationResult";


/*
==========================================================
Validation Rule Types
==========================================================
*/

export type ValidationRuleType =

    /* Presence */
    | "required"
    | "optional"
    | "nullable"

    /* Primitive */
    | "string"
    | "number"
    | "boolean"
    | "bigint"
    | "symbol"
    | "integer"
    | "finite"

    /* Structure */
    | "array"
    | "object"

    /* String */
    | "email"
    | "url"
    | "uuid"
    | "pattern"
    | "minLength"
    | "maxLength"

    /* Numeric */
    | "min"
    | "max"
    | "positive"
    | "negative"
    | "nonNegative"
    | "nonPositive"

    /* Collection */
    | "unique"
    | "contains"

    /* Value */
    | "enum"
    | "literal"

    /* Custom */
    | "custom";


/*
==========================================================
Validation Rule Options
==========================================================
*/

export interface ValidationRuleOptions {

    /**
     * Generic value.
     */
    readonly value?: unknown;

    /**
     * Numeric limit.
     */
    readonly min?: number;

    /**
     * Numeric limit.
     */
    readonly max?: number;

    /**
     * String minimum length.
     */
    readonly minLength?: number;

    /**
     * String maximum length.
     */
    readonly maxLength?: number;

    /**
     * Regular expression.
     */
    readonly pattern?: RegExp | string;

    /**
     * Allowed values.
     */
    readonly enum?: readonly unknown[];

    /**
     * Literal expected value.
     */
    readonly literal?: unknown;

    /**
     * Nested item rule.
     */
    readonly item?: ValidationRule;

    /**
     * Nested object rules.
     */
    readonly fields?:
        Readonly<Record<string, ValidationRule | ValidationRule[]>>;

    /**
     * Custom validator function.
     */
    readonly validate?: ValidationRuleValidator;

    /**
     * Custom error message.
     */
    readonly message?: string;

    /**
     * Arbitrary metadata.
     */
    readonly metadata?: Readonly<
        Record<string, unknown>
    >;

}


/*
==========================================================
Validation Rule
==========================================================
*/

export interface ValidationRule {

    /**
     * Rule type.
     */
    readonly type: ValidationRuleType;

    /**
     * Rule options.
     */
    readonly options?: ValidationRuleOptions;

    /**
     * Rule error message.
     */
    readonly message?: string;

    /**
     * Rule execution priority.
     *
     * Lower values execute first.
     *
     * Default: 0.
     */
    readonly priority?: number;

    /**
     * Whether this rule is enabled.
     *
     * Default: true.
     */
    readonly enabled?: boolean;

}


/*
==========================================================
Custom Rule Validator
==========================================================
*/

export type ValidationRuleValidator = (
    value: unknown,
    context?: ValidationContext,
) =>
    | boolean
    | ValidationRuleValidationResult;


export interface ValidationRuleValidationResult {

    readonly valid: boolean;

    readonly message?: string;

    readonly code?: string;

}


/*
==========================================================
Rule Execution Result
==========================================================
*/

export interface ValidationRuleResult {

    readonly valid: boolean;

    readonly issues: readonly ValidationIssue[];

}


/*
==========================================================
Rule Factory Options
==========================================================
*/

export interface CreateRuleOptions {

    readonly message?: string;

    readonly priority?: number;

    readonly enabled?: boolean;

    readonly options?: ValidationRuleOptions;

}


/*
==========================================================
Validation Rule Factory
==========================================================
*/

export class ValidationRuleFactory {

    /*
    ======================================================
    Create
    ======================================================
    */

    public static create(
        type: ValidationRuleType,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return {

            type,

            options: options.options,

            message: options.message,

            priority:
                options.priority ?? 0,

            enabled:
                options.enabled ?? true,

        };

    }


    /*
    ======================================================
    Required
    ======================================================
    */

    public static required(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "required",
            options,
        );

    }


    /*
    ======================================================
    Optional
    ======================================================
    */

    public static optional(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "optional",
            options,
        );

    }


    /*
    ======================================================
    Nullable
    ======================================================
    */

    public static nullable(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "nullable",
            options,
        );

    }


    /*
    ======================================================
    String
    ======================================================
    */

    public static string(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "string",
            options,
        );

    }


    /*
    ======================================================
    Number
    ======================================================
    */

    public static number(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "number",
            options,
        );

    }


    /*
    ======================================================
    Boolean
    ======================================================
    */

    public static boolean(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "boolean",
            options,
        );

    }


    /*
    ======================================================
    Integer
    ======================================================
    */

    public static integer(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "integer",
            options,
        );

    }


    /*
    ======================================================
    Finite
    ======================================================
    */

    public static finite(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "finite",
            options,
        );

    }


    /*
    ======================================================
    Array
    ======================================================
    */

    public static array(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "array",
            options,
        );

    }


    /*
    ======================================================
    Object
    ======================================================
    */

    public static object(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "object",
            options,
        );

    }


    /*
    ======================================================
    Email
    ======================================================
    */

    public static email(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "email",
            options,
        );

    }


    /*
    ======================================================
    URL
    ======================================================
    */

    public static url(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "url",
            options,
        );

    }


    /*
    ======================================================
    UUID
    ======================================================
    */

    public static uuid(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "uuid",
            options,
        );

    }


    /*
    ======================================================
    Pattern
    ======================================================
    */

    public static pattern(
        pattern: RegExp | string,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "pattern",
            {

                ...options,

                options: {

                    ...options.options,

                    pattern,

                },

            },
        );

    }


    /*
    ======================================================
    Min
    ======================================================
    */

    public static min(
        min: number,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "min",
            {

                ...options,

                options: {

                    ...options.options,

                    min,

                },

            },
        );

    }


    /*
    ======================================================
    Max
    ======================================================
    */

    public static max(
        max: number,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "max",
            {

                ...options,

                options: {

                    ...options.options,

                    max,

                },

            },
        );

    }


    /*
    ======================================================
    Min Length
    ======================================================
    */

    public static minLength(
        minLength: number,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "minLength",
            {

                ...options,

                options: {

                    ...options.options,

                    minLength,

                },

            },
        );

    }


    /*
    ======================================================
    Max Length
    ======================================================
    */

    public static maxLength(
        maxLength: number,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "maxLength",
            {

                ...options,

                options: {

                    ...options.options,

                    maxLength,

                },

            },
        );

    }


    /*
    ======================================================
    Positive
    ======================================================
    */

    public static positive(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "positive",
            options,
        );

    }


    /*
    ======================================================
    Negative
    ======================================================
    */

    public static negative(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "negative",
            options,
        );

    }


    /*
    ======================================================
    Non Negative
    ======================================================
    */

    public static nonNegative(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "nonNegative",
            options,
        );

    }


    /*
    ======================================================
    Non Positive
    ======================================================
    */

    public static nonPositive(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "nonPositive",
            options,
        );

    }


    /*
    ======================================================
    Unique
    ======================================================
    */

    public static unique(
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "unique",
            options,
        );

    }


    /*
    ======================================================
    Contains
    ======================================================
    */

    public static contains(
        value: unknown,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "contains",
            {

                ...options,

                options: {

                    ...options.options,

                    value,

                },

            },
        );

    }


    /*
    ======================================================
    Enum
    ======================================================
    */

    public static enum(
        values: readonly unknown[],
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "enum",
            {

                ...options,

                options: {

                    ...options.options,

                    enum: values,

                },

            },
        );

    }


    /*
    ======================================================
    Literal
    ======================================================
    */

    public static literal(
        value: unknown,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "literal",
            {

                ...options,

                options: {

                    ...options.options,

                    literal: value,

                },

            },
        );

    }


    /*
    ======================================================
    Custom
    ======================================================
    */

    public static custom(
        validate: ValidationRuleValidator,
        options: CreateRuleOptions = {},
    ): ValidationRule {

        return this.create(
            "custom",
            {

                ...options,

                options: {

                    ...options.options,

                    validate,

                },

            },
        );

    }

}


/*
==========================================================
Validation Rule Utilities
==========================================================
*/

export class ValidationRuleUtils {

    /*
    ======================================================
    Is Enabled
    ======================================================
    */

    public static isEnabled(
        rule: ValidationRule,
    ): boolean {

        return rule.enabled !== false;

    }


    /*
    ======================================================
    Sort
    ======================================================
    */

    public static sort(
        rules: readonly ValidationRule[],
    ): readonly ValidationRule[] {

        return [...rules].sort(

            (a, b) =>
                (a.priority ?? 0) -
                (b.priority ?? 0),

        );

    }


    /*
    ======================================================
    Normalize
    ======================================================
    */

    public static normalize(
        rule:
            ValidationRule |
            ValidationRuleType,
    ): ValidationRule {

        if (
            typeof rule === "string"
        ) {

            return {

                type: rule,

                enabled: true,

                priority: 0,

            };

        }


        return {

            ...rule,

            enabled:
                rule.enabled !== false,

            priority:
                rule.priority ?? 0,

        };

    }


    /*
    ======================================================
    Normalize List
    ======================================================
    */

    public static normalizeList(
        rules:
            readonly (
                | ValidationRule
                | ValidationRuleType
            )[],
    ): readonly ValidationRule[] {

        return this.sort(

            rules
                .map(
                    rule =>
                        this.normalize(rule),
                )
                .filter(
                    rule =>
                        this.isEnabled(rule),
                ),

        );

    }


    /*
    ======================================================
    Get Option
    ======================================================
    */

    public static getOption<T = unknown>(
        rule: ValidationRule,
        key: keyof ValidationRuleOptions,
    ): T | undefined {

        return rule.options?.[key] as
            T | undefined;

    }


    /*
    ======================================================
    Get Message
    ======================================================
    */

    public static getMessage(
        rule: ValidationRule,
        fallback: string,
    ): string {

        return (
            rule.message ??
            rule.options?.message ??
            fallback
        );

    }


    /*
    ======================================================
    Clone
    ======================================================
    */

    public static clone(
        rule: ValidationRule,
    ): ValidationRule {

        return {

            ...rule,

            options: rule.options
                ? {
                    ...rule.options,
                }
                : undefined,

        };

    }

}


/*
==========================================================
Rule Runner
==========================================================
*/

export class ValidationRuleRunner {

    /*
    ======================================================
    Run
    ======================================================
    */

    public static run(
        rule: ValidationRule,
        value: unknown,
        context?: ValidationContext,
    ): ValidationRuleResult {

        /*
        ==================================================
        Disabled Rule
        ==================================================
        */

        if (
            !ValidationRuleUtils.isEnabled(
                rule,
            )
        ) {

            return {

                valid: true,

                issues: [],

            };

        }


        /*
        ==================================================
        Custom Rule
        ==================================================
        */

        if (
            rule.type === "custom"
        ) {

            return this.runCustom(
                rule,
                value,
                context,
            );

        }


        /*
        ==================================================
        Built-in Rule
        ==================================================
        */

        const valid =
            this.evaluateBuiltIn(
                rule,
                value,
            );


        if (valid) {

            return {

                valid: true,

                issues: [],

            };

        }


        const message =
            ValidationRuleUtils.getMessage(
                rule,
                `Validation rule "${rule.type}" failed.`,
            );


        return {

            valid: false,

            issues: [

                {

                    path: "",

                    code: rule.type,

                    message,

                } as ValidationIssue,

            ],

        };

    }


    /*
    ======================================================
    Custom Runner
    ======================================================
    */

    private static runCustom(
        rule: ValidationRule,
        value: unknown,
        context?: ValidationContext,
    ): ValidationRuleResult {

        const validator =
            rule.options?.validate;


        if (
            validator === undefined
        ) {

            return {

                valid: false,

                issues: [

                    {

                        path: "",

                        code: "custom",

                        message:
                            "Custom validation function is missing.",

                    } as ValidationIssue,

                ],

            };

        }


        const result =
            validator(
                value,
                context,
            );


        if (
            typeof result === "boolean"
        ) {

            if (result) {

                return {

                    valid: true,

                    issues: [],

                };

            }


            return {

                valid: false,

                issues: [

                    {

                        path: "",

                        code: "custom",

                        message:
                            ValidationRuleUtils.getMessage(
                                rule,
                                "Custom validation failed.",
                            ),

                    } as ValidationIssue,

                ],

            };

        }


        if (
            result.valid
        ) {

            return {

                valid: true,

                issues: [],

            };

        }


        return {

            valid: false,

            issues: [

                {

                    path: "",

                    code:
                        result.code ??
                        "custom",

                    message:
                        result.message ??
                        ValidationRuleUtils.getMessage(
                            rule,
                            "Custom validation failed.",
                        ),

                } as ValidationIssue,

            ],

        };

    }


    /*
    ======================================================
    Built-in Evaluation
    ======================================================
    */

    private static evaluateBuiltIn(
        rule: ValidationRule,
        value: unknown,
    ): boolean {

        switch (rule.type) {

            /*
            ==============================================
            Presence
            ==============================================
            */

            case "required":

                return (
                    value !== undefined &&
                    value !== null &&
                    !this.isEmpty(value)
                );


            case "optional":

                return true;


            case "nullable":

                return (
                    value === null ||
                    value !== undefined
                );


            /*
            ==============================================
            Primitive
            ==============================================
            */

            case "string":

                return typeof value === "string";


            case "number":

                return (
                    typeof value === "number" &&
                    !Number.isNaN(value)
                );


            case "boolean":

                return typeof value === "boolean";


            case "bigint":

                return typeof value === "bigint";


            case "symbol":

                return typeof value === "symbol";


            case "integer":

                return (
                    typeof value === "number" &&
                    Number.isInteger(value)
                );


            case "finite":

                return (
                    typeof value === "number" &&
                    Number.isFinite(value)
                );


            /*
            ==============================================
            Structure
            ==============================================
            */

            case "array":

                return Array.isArray(value);


            case "object":

                return (
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value)
                );


            /*
            ==============================================
            String
            ==============================================
            */

            case "email":

                return (
                    typeof value === "string" &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        .test(value)
                );


            case "url":

                if (
                    typeof value !== "string"
                ) {

                    return false;

                }

                try {

                    new URL(value);

                    return true;

                } catch {

                    return false;

                }


            case "uuid":

                return (
                    typeof value === "string" &&
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                        .test(value)
                );


            case "pattern": {

                if (
                    typeof value !== "string"
                ) {

                    return false;

                }


                const pattern =
                    rule.options?.pattern;


                if (
                    pattern === undefined
                ) {

                    return false;

                }


                const regex =
                    pattern instanceof RegExp
                        ? pattern
                        : new RegExp(pattern);


                return regex.test(value);

            }


            case "minLength":

                return (
                    typeof value === "string" &&
                    rule.options?.minLength !== undefined &&
                    value.length >=
                        rule.options.minLength
                );


            case "maxLength":

                return (
                    typeof value === "string" &&
                    rule.options?.maxLength !== undefined &&
                    value.length <=
                        rule.options.maxLength
                );


            /*
            ==============================================
            Numeric
            ==============================================
            */

            case "min":

                return this.checkMin(
                    value,
                    rule.options?.min,
                );


            case "max":

                return this.checkMax(
                    value,
                    rule.options?.max,
                );


            case "positive":

                return (
                    typeof value === "number" &&
                    value > 0
                );


            case "negative":

                return (
                    typeof value === "number" &&
                    value < 0
                );


            case "nonNegative":

                return (
                    typeof value === "number" &&
                    value >= 0
                );


            case "nonPositive":

                return (
                    typeof value === "number" &&
                    value <= 0
                );


            /*
            ==============================================
            Collection
            ==============================================
            */

            case "unique":

                return this.isUnique(
                    value,
                );


            case "contains":

                return this.contains(
                    value,
                    rule.options?.value,
                );


            /*
            ==============================================
            Value
            ==============================================
            */

            case "enum":

                return (
                    rule.options?.enum?.some(
                        item =>
                            Object.is(
                                item,
                                value,
                            ),
                    ) === true
                );


            case "literal":

                return Object.is(
                    value,
                    rule.options?.literal,
                );


            /*
            ==============================================
            Custom
            ==============================================
            */

            case "custom":

                return true;


            default:

                return false;

        }

    }


    /*
    ======================================================
    Empty
    ======================================================
    */

    private static isEmpty(
        value: unknown,
    ): boolean {

        if (
            value === null ||
            value === undefined
        ) {

            return true;

        }


        if (
            typeof value === "string"
        ) {

            return value.trim().length === 0;

        }


        if (
            Array.isArray(value)
        ) {

            return value.length === 0;

        }


        return false;

    }


    /*
    ======================================================
    Min
    ======================================================
    */

    private static checkMin(
        value: unknown,
        min: number | undefined,
    ): boolean {

        if (
            min === undefined
        ) {

            return false;

        }


        if (
            typeof value === "number"
        ) {

            return value >= min;

        }


        if (
            typeof value === "string"
        ) {

            return value.length >= min;

        }


        if (
            Array.isArray(value)
        ) {

            return value.length >= min;

        }


        return false;

    }


    /*
    ======================================================
    Max
    ======================================================
    */

    private static checkMax(
        value: unknown,
        max: number | undefined,
    ): boolean {

        if (
            max === undefined
        ) {

            return false;

        }


        if (
            typeof value === "number"
        ) {

            return value <= max;

        }


        if (
            typeof value === "string"
        ) {

            return value.length <= max;

        }


        if (
            Array.isArray(value)
        ) {

            return value.length <= max;

        }


        return false;

    }


    /*
    ======================================================
    Unique
    ======================================================
    */

    private static isUnique(
        value: unknown,
    ): boolean {

        if (
            !Array.isArray(value)
        ) {

            return false;

        }


        const seen =
            new Set<unknown>();


        for (
            const item
            of value
        ) {

            if (
                seen.has(item)
            ) {

                return false;

            }


            seen.add(item);

        }


        return true;

    }


    /*
    ======================================================
    Contains
    ======================================================
    */

    private static contains(
        value: unknown,
        expected: unknown,
    ): boolean {

        if (
            typeof value === "string"
        ) {

            return (
                typeof expected === "string" &&
                value.includes(expected)
            );

        }


        if (
            Array.isArray(value)
        ) {

            return value.some(
                item =>
                    Object.is(
                        item,
                        expected,
                    ),
            );

        }


        return false;

    }

}


/*
==========================================================
Convenience Functions
==========================================================
*/

export function createValidationRule(
    type: ValidationRuleType,
    options: CreateRuleOptions = {},
): ValidationRule {

    return ValidationRuleFactory.create(
        type,
        options,
    );

}


export function normalizeValidationRule(
    rule:
        ValidationRule |
        ValidationRuleType,
): ValidationRule {

    return ValidationRuleUtils.normalize(
        rule,
    );

}


export function normalizeValidationRules(
    rules:
        readonly (
            | ValidationRule
            | ValidationRuleType
        )[],
): readonly ValidationRule[] {

    return ValidationRuleUtils.normalizeList(
        rules,
    );

}


export function runValidationRule(
    rule: ValidationRule,
    value: unknown,
    context?: ValidationContext,
): ValidationRuleResult {

    return ValidationRuleRunner.run(
        rule,
        value,
        context,
    );

}
