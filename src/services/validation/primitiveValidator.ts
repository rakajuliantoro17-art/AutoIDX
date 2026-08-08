/**
==========================================================
AURA Trade OS
Primitive Validator
Version : 0.0.7 Alpha
==========================================================
Primitive Validation Implementation
==========================================================
*/

import type {
    Validator,
} from "./validator";

import type {
    ValidationContext,
} from "./validationContext";

import type {
    ValidationIssue,
    ValidationResult,
    ValidationWarning,
} from "./validationResult";


/*
==========================================================
Types
==========================================================
*/

export type PrimitiveType =

    | "string"
    | "number"
    | "boolean"
    | "bigint"
    | "symbol"
    | "null"
    | "undefined"
    | "integer"
    | "finite";


export interface PrimitiveValidatorOptions {

    /**
     * Expected primitive type.
     */
    readonly type?: PrimitiveType;

    /**
     * Minimum numeric value or string length.
     */
    readonly min?: number;

    /**
     * Maximum numeric value or string length.
     */
    readonly max?: number;

    /**
     * Minimum string length.
     */
    readonly minLength?: number;

    /**
     * Maximum string length.
     */
    readonly maxLength?: number;

    /**
     * Optional regular expression for strings.
     */
    readonly pattern?: RegExp | string;

    /**
     * Optional enumeration.
     */
    readonly enum?: readonly unknown[];

    /**
     * Whether null is accepted.
     *
     * Default: false.
     */
    readonly nullable?: boolean;

    /**
     * Whether undefined is accepted.
     *
     * Default: false.
     */
    readonly optional?: boolean;

    /**
     * Stop after first validation error.
     *
     * Default: false.
     */
    readonly failFast?: boolean;

}


/*
==========================================================
Primitive Validator
==========================================================
*/

export class PrimitiveValidator
    implements Validator<unknown> {

    private readonly options:
        PrimitiveValidatorOptions;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        options: PrimitiveValidatorOptions = {},
    ) {

        this.options = {

            nullable: false,

            optional: false,

            failFast: false,

            ...options,

        };

    }


    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(
        value: unknown,
        _context?: ValidationContext,
    ): ValidationResult {

        const issues: ValidationIssue[] = [];

        const warnings: ValidationWarning[] = [];


        /*
        ==================================================
        Undefined
        ==================================================
        */

        if (
            value === undefined
        ) {

            if (
                this.options.optional
            ) {

                return this.createResult(
                    issues,
                    warnings,
                );

            }


            issues.push(

                this.createIssue(

                    "",

                    "required",

                    "Value is required.",

                ),

            );


            return this.createResult(
                issues,
                warnings,
            );

        }


        /*
        ==================================================
        Null
        ==================================================
        */

        if (
            value === null
        ) {

            if (
                this.options.nullable
            ) {

                return this.createResult(
                    issues,
                    warnings,
                );

            }


            issues.push(

                this.createIssue(

                    "",

                    "null",

                    "Value must not be null.",

                ),

            );


            return this.createResult(
                issues,
                warnings,
            );

        }


        /*
        ==================================================
        Expected Type
        ==================================================
        */

        if (
            this.options.type !== undefined
        ) {

            if (
                !this.matchesType(
                    value,
                    this.options.type,
                )
            ) {

                issues.push(

                    this.createIssue(

                        "",

                        "type",

                        `Value must be of type ${this.options.type}.`,

                    ),

                );


                if (
                    this.options.failFast
                ) {

                    return this.createResult(
                        issues,
                        warnings,
                    );

                }

            }

        }


        /*
        ==================================================
        Number Validation
        ==================================================
        */

        if (
            typeof value === "number"
        ) {

            this.validateNumber(
                value,
                issues,
            );

        }


        /*
        ==================================================
        String Validation
        ==================================================
        */

        if (
            typeof value === "string"
        ) {

            this.validateString(
                value,
                issues,
            );

        }


        /*
        ==================================================
        Enum Validation
        ==================================================
        */

        if (
            this.options.enum !== undefined
        ) {

            const valid =
                this.options.enum.some(
                    item => Object.is(
                        item,
                        value,
                    ),
                );


            if (!valid) {

                issues.push(

                    this.createIssue(

                        "",

                        "enum",

                        "Value is not an allowed value.",

                    ),

                );

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
    Validate Number
    ======================================================
    */

    private validateNumber(
        value: number,
        issues: ValidationIssue[],
    ): void {

        /*
        ==================================================
        Finite
        ==================================================
        */

        if (
            this.options.type === "finite" &&
            !Number.isFinite(value)
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "finite",

                    "Value must be a finite number.",

                ),

            );

        }


        /*
        ==================================================
        Integer
        ==================================================
        */

        if (
            this.options.type === "integer" &&
            !Number.isInteger(value)
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "integer",

                    "Value must be an integer.",

                ),

            );

        }


        /*
        ==================================================
        Min
        ==================================================
        */

        if (
            this.options.min !== undefined &&
            value < this.options.min
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "min",

                    `Value must be at least ${this.options.min}.`,

                ),

            );

        }


        /*
        ==================================================
        Max
        ==================================================
        */

        if (
            this.options.max !== undefined &&
            value > this.options.max
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "max",

                    `Value must be at most ${this.options.max}.`,

                ),

            );

        }

    }


    /*
    ======================================================
    Validate String
    ======================================================
    */

    private validateString(
        value: string,
        issues: ValidationIssue[],
    ): void {

        /*
        ==================================================
        Min Length
        ==================================================
        */

        if (
            this.options.minLength !== undefined &&
            value.length < this.options.minLength
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "minLength",

                    `String must contain at least ${this.options.minLength} character(s).`,

                ),

            );

        }


        /*
        ==================================================
        Max Length
        ==================================================
        */

        if (
            this.options.maxLength !== undefined &&
            value.length > this.options.maxLength
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "maxLength",

                    `String must contain at most ${this.options.maxLength} character(s).`,

                ),

            );

        }


        /*
        ==================================================
        Min / Max as Length
        ==================================================
        */

        if (
            this.options.min !== undefined &&
            value.length < this.options.min
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "min",

                    `String length must be at least ${this.options.min}.`,

                ),

            );

        }


        if (
            this.options.max !== undefined &&
            value.length > this.options.max
        ) {

            issues.push(

                this.createIssue(

                    "",

                    "max",

                    `String length must be at most ${this.options.max}.`,

                ),

            );

        }


        /*
        ==================================================
        Pattern
        ==================================================
        */

        if (
            this.options.pattern !== undefined
        ) {

            const regex =
                this.toRegExp(
                    this.options.pattern,
                );


            if (
                regex !== undefined &&
                !regex.test(value)
            ) {

                issues.push(

                    this.createIssue(

                        "",

                        "pattern",

                        "Value has an invalid format.",

                    ),

                );

            }

        }

    }


    /*
    ======================================================
    Match Type
    ======================================================
    */

    private matchesType(
        value: unknown,
        type: PrimitiveType,
    ): boolean {

        switch (type) {

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


            case "null":

                return value === null;


            case "undefined":

                return value === undefined;


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


            default:

                return false;

        }

    }


    /*
    ======================================================
    RegExp Conversion
    ======================================================
    */

    private toRegExp(
        value: RegExp | string,
    ): RegExp | undefined {

        if (
            value instanceof RegExp
        ) {

            return value;

        }


        try {

            return new RegExp(value);

        } catch {

            return undefined;

        }

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
Factory
==========================================================
*/

export function createPrimitiveValidator(
    options: PrimitiveValidatorOptions = {},
): PrimitiveValidator {

    return new PrimitiveValidator(
        options,
    );

}
