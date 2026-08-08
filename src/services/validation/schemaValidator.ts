/**
==========================================================
AURA Trade OS
Schema Validator
Version : 0.3.0 Alpha
==========================================================
Schema-based Validation Implementation
==========================================================
*/

import type {
    Validator,
} from "./validator";

import type {
    ValidationContext,
} from "./validationContext";

import type {
    ValidationResult,
    ValidationIssue,
    ValidationWarning,
} from "./validationResult";

import type {
    Schema,
    SchemaField,
    ValidationRule,
} from "./schema";


/*
==========================================================
Types
==========================================================
*/

export interface SchemaValidationOptions {

    /**
     * Stop validation after the first failed field.
     */
    readonly failFast?: boolean;

    /**
     * Stop validation after the first failed rule
     * within a field.
     */
    readonly stopOnFieldError?: boolean;

}


/*
==========================================================
Schema Validator
==========================================================
*/

export class SchemaValidator<T = unknown>
    implements Validator<T> {

    private readonly schema: Schema;

    private readonly options: SchemaValidationOptions;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        schema: Schema,
        options: SchemaValidationOptions = {},
    ) {

        this.schema = schema;

        this.options = {
            failFast: false,
            stopOnFieldError: false,
            ...options,
        };

    }


    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(
        value: T,
        context?: ValidationContext,
    ): ValidationResult {

        const issues: ValidationIssue[] = [];

        const warnings: ValidationWarning[] = [];

        /*
        ==================================================
        Root Validation
        ==================================================
        */

        if (this.schema.fields.length === 0) {

            return this.createResult(
                issues,
                warnings,
            );

        }


        /*
        ==================================================
        Field Validation
        ==================================================
        */

        for (const field of this.schema.fields) {

            const fieldValue = this.getFieldValue(
                value,
                field.name,
            );

            const fieldIssues = this.validateField(
                field,
                fieldValue,
                context,
            );

            issues.push(
                ...fieldIssues,
            );


            /*
            ==============================================
            Field Fail Fast
            ==============================================
            */

            if (
                this.options.stopOnFieldError &&
                fieldIssues.length > 0
            ) {

                continue;

            }


            /*
            ==============================================
            Global Fail Fast
            ==============================================
            */

            if (
                this.options.failFast &&
                issues.length > 0
            ) {

                break;

            }

        }


        /*
        ==================================================
        Result
        ==================================================
        */

        return this.createResult(
            issues,
            warnings,
        );

    }


    /*
    ======================================================
    Validate Field
    ======================================================
    */

    private validateField(
        field: SchemaField,
        value: unknown,
        context?: ValidationContext,
    ): ValidationIssue[] {

        const issues: ValidationIssue[] = [];

        const rules = field.rules;

        /*
        ==================================================
        Undefined / Null Handling
        ==================================================
        */

        const hasValue =
            value !== undefined &&
            value !== null;

        const required =
            rules.includes("required");


        /*
        ==================================================
        Required
        ==================================================
        */

        if (required) {

            if (!hasValue || this.isEmpty(value)) {

                issues.push(
                    this.createIssue(
                        field.name,
                        "required",
                        `${field.name} is required.`,
                    ),
                );

                return issues;

            }

        }


        /*
        ==================================================
        Optional Field
        ==================================================
        */

        if (!hasValue) {

            return issues;

        }


        /*
        ==================================================
        String
        ==================================================
        */

        if (
            rules.includes("string") &&
            typeof value !== "string"
        ) {

            issues.push(
                this.createIssue(
                    field.name,
                    "string",
                    `${field.name} must be a string.`,
                ),
            );

        }


        /*
        ==================================================
        Number
        ==================================================
        */

        if (
            rules.includes("number") &&
            (
                typeof value !== "number" ||
                Number.isNaN(value)
            )
        ) {

            issues.push(
                this.createIssue(
                    field.name,
                    "number",
                    `${field.name} must be a valid number.`,
                ),
            );

        }


        /*
        ==================================================
        Boolean
        ==================================================
        */

        if (
            rules.includes("boolean") &&
            typeof value !== "boolean"
        ) {

            issues.push(
                this.createIssue(
                    field.name,
                    "boolean",
                    `${field.name} must be a boolean.`,
                ),
            );

        }


        /*
        ==================================================
        Array
        ==================================================
        */

        if (
            rules.includes("array") &&
            !Array.isArray(value)
        ) {

            issues.push(
                this.createIssue(
                    field.name,
                    "array",
                    `${field.name} must be an array.`,
                ),
            );

        }


        /*
        ==================================================
        Object
        ==================================================
        */

        if (
            rules.includes("object") &&
            !this.isObject(value)
        ) {

            issues.push(
                this.createIssue(
                    field.name,
                    "object",
                    `${field.name} must be an object.`,
                ),
            );

        }


        /*
        ==================================================
        Email
        ==================================================
        */

        if (
            rules.includes("email") &&
            typeof value === "string"
        ) {

            if (!this.isValidEmail(value)) {

                issues.push(
                    this.createIssue(
                        field.name,
                        "email",
                        `${field.name} must be a valid email address.`,
                    ),
                );

            }

        }


        /*
        ==================================================
        Min
        ==================================================
        */

        if (
            rules.includes("min")
        ) {

            const min = this.getRuleOption(
                field,
                "min",
                "min",
                context,
            );

            if (
                min !== undefined &&
                !this.isGreaterThanOrEqual(
                    value,
                    min,
                )
            ) {

                issues.push(
                    this.createIssue(
                        field.name,
                        "min",
                        `${field.name} must be at least ${min}.`,
                    ),
                );

            }

        }


        /*
        ==================================================
        Max
        ==================================================
        */

        if (
            rules.includes("max")
        ) {

            const max = this.getRuleOption(
                field,
                "max",
                "max",
                context,
            );

            if (
                max !== undefined &&
                !this.isLessThanOrEqual(
                    value,
                    max,
                )
            ) {

                issues.push(
                    this.createIssue(
                        field.name,
                        "max",
                        `${field.name} must be at most ${max}.`,
                    ),
                );

            }

        }


        /*
        ==================================================
        Pattern
        ==================================================
        */

        if (
            rules.includes("pattern") &&
            typeof value === "string"
        ) {

            const pattern =
                this.getRuleOption(
                    field,
                    "pattern",
                    "pattern",
                    context,
                );

            if (pattern !== undefined) {

                const regex =
                    this.toRegExp(pattern);

                if (
                    regex !== undefined &&
                    !regex.test(value)
                ) {

                    issues.push(
                        this.createIssue(
                            field.name,
                            "pattern",
                            `${field.name} has an invalid format.`,
                        ),
                    );

                }

            }

        }


        return issues;

    }


    /*
    ======================================================
    Get Field Value
    ======================================================
    */

    private getFieldValue(
        value: unknown,
        path: string,
    ): unknown {

        if (
            value === null ||
            value === undefined
        ) {

            return undefined;

        }


        /*
        ==================================================
        Direct Property
        ==================================================
        */

        if (
            typeof value !== "object" ||
            value === null
        ) {

            return undefined;

        }


        const segments = path
            .split(".")
            .filter(Boolean);


        let current: unknown = value;


        /*
        ==================================================
        Nested Property
        ==================================================
        */

        for (const segment of segments) {

            if (
                current === null ||
                current === undefined ||
                typeof current !== "object"
            ) {

                return undefined;

            }


            if (
                !Object.prototype.hasOwnProperty.call(
                    current,
                    segment,
                )
            ) {

                return undefined;

            }


            current = (
                current as Record<string, unknown>
            )[segment];

        }


        return current;

    }


    /*
    ======================================================
    Empty Value
    ======================================================
    */

    private isEmpty(
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
    Object Detection
    ======================================================
    */

    private isObject(
        value: unknown,
    ): value is Record<string, unknown> {

        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        );

    }


    /*
    ======================================================
    Email Validation
    ======================================================
    */

    private isValidEmail(
        value: string,
    ): boolean {

        const pattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return pattern.test(value);

    }


    /*
    ======================================================
    Min Validation
    ======================================================
    */

    private isGreaterThanOrEqual(
        value: unknown,
        min: unknown,
    ): boolean {

        if (
            typeof min !== "number"
        ) {

            return true;

        }


        if (
            typeof value === "number"
        ) {

            return value >= min;

        }


        if (
            typeof value === "string" ||
            Array.isArray(value)
        ) {

            return value.length >= min;

        }


        return true;

    }


    /*
    ======================================================
    Max Validation
    ======================================================
    */

    private isLessThanOrEqual(
        value: unknown,
        max: unknown,
    ): boolean {

        if (
            typeof max !== "number"
        ) {

            return true;

        }


        if (
            typeof value === "number"
        ) {

            return value <= max;

        }


        if (
            typeof value === "string" ||
            Array.isArray(value)
        ) {

            return value.length <= max;

        }


        return true;

    }


    /*
    ======================================================
    Rule Option
    ======================================================
    */

    private getRuleOption(
        field: SchemaField,
        rule: ValidationRule,
        optionName: string,
        _context?: ValidationContext,
    ): unknown {

        if (
            !field.options
        ) {

            return undefined;

        }


        /*
        ==================================================
        Primary Rule Option
        ==================================================
        */

        const direct =
            field.options[optionName];

        if (
            direct !== undefined
        ) {

            return direct;

        }


        /*
        ==================================================
        Rule-specific Option
        ==================================================
        */

        const ruleOptions =
            field.options[rule];

        if (
            this.isObject(ruleOptions)
        ) {

            return ruleOptions[
                optionName
            ];

        }


        return undefined;

    }


    /*
    ======================================================
    RegExp Conversion
    ======================================================
    */

    private toRegExp(
        value: unknown,
    ): RegExp | undefined {

        if (
            value instanceof RegExp
        ) {

            return value;

        }


        if (
            typeof value === "string"
        ) {

            try {

                return new RegExp(value);

            } catch {

                return undefined;

            }

        }


        return undefined;

    }


    /*
    ======================================================
    Create Issue
    ======================================================
    */

    private createIssue(
        path: string,
        code: string,
        message: string,
    ): ValidationIssue {

        return {

            path,

            message,

            code,

        } as ValidationIssue;

    }


    /*
    ======================================================
    Create Result
    ======================================================
    */

    private createResult(
        issues: readonly ValidationIssue[],
        warnings: readonly ValidationWarning[],
    ): ValidationResult {

        return {

            valid: issues.length === 0,

            issues,

            warnings,


        };

    }

}


/*
==========================================================
Default Factory
==========================================================
*/

export function createSchemaValidator<T = unknown>(
    schema: Schema,
    options: SchemaValidationOptions = {},
): SchemaValidator<T> {

    return new SchemaValidator<T>(
        schema,
        options,
    );

}
