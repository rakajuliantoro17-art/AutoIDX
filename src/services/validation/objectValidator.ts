/**
==========================================================
AURA Trade OS
Object Validator
Version : 0.0.7 Alpha
==========================================================
Object Validation Implementation
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

export interface ObjectFieldValidator<T = unknown> {

    /**
     * Validator for a specific object field.
     */
    readonly validator: Validator<T>;

    /**
     * Whether the field must exist.
     */
    readonly required?: boolean;

}


export interface ObjectValidatorOptions {

    /**
     * Validators for object fields.
     *
     * Example:
     *
     * {
     *     username: {
     *         validator: usernameValidator,
     *         required: true
     *     }
     * }
     */
    readonly fields?:
        Readonly<Record<string, ObjectFieldValidator>>;

    /**
     * Whether properties without a validator
     * are allowed.
     *
     * Default: true
     */
    readonly allowUnknown?: boolean;

    /**
     * Explicit list of required fields.
     *
     * This can be used independently from
     * the field validator configuration.
     */
    readonly requiredFields?: readonly string[];

    /**
     * Stop after the first validation error.
     *
     * Default: false
     */
    readonly failFast?: boolean;

}


/*
==========================================================
Object Validator
==========================================================
*/

export class ObjectValidator
    implements Validator<unknown> {

    private readonly options:
        ObjectValidatorOptions;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        options: ObjectValidatorOptions = {},
    ) {

        this.options = {

            allowUnknown: true,

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
        context?: ValidationContext,
    ): ValidationResult {

        const issues: ValidationIssue[] = [];

        const warnings: ValidationWarning[] = [];


        /*
        ==================================================
        Type
        ==================================================
        */

        if (!this.isObject(value)) {

            issues.push(

                this.createIssue(

                    "",

                    "object",

                    "Value must be an object.",

                ),

            );

            return this.createResult(
                issues,
                warnings,
            );

        }


        const objectValue =
            value as Record<string, unknown>;


        /*
        ==================================================
        Required Fields
        ==================================================
        */

        const requiredFields =
            new Set<string>(

                this.options.requiredFields ?? [],

            );


        for (
            const [fieldName, configuration]
            of Object.entries(
                this.options.fields ?? {},
            )
        ) {

            if (
                configuration.required
            ) {

                requiredFields.add(
                    fieldName,
                );

            }

        }


        for (
            const fieldName
            of requiredFields
        ) {

            if (
                !this.hasOwnProperty(
                    objectValue,
                    fieldName,
                )
            ) {

                issues.push(

                    this.createIssue(

                        fieldName,

                        "required",

                        `${fieldName} is required.`,

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
        Unknown Fields
        ==================================================
        */

        if (
            !this.options.allowUnknown
        ) {

            const knownFields =
                new Set<string>(

                    Object.keys(
                        this.options.fields ?? {},
                    ),

                );


            for (
                const fieldName
                of Object.keys(objectValue)
            ) {

                if (
                    !knownFields.has(
                        fieldName,
                    )
                ) {

                    issues.push(

                        this.createIssue(

                            fieldName,

                            "unknown",

                            `${fieldName} is not allowed.`,

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

        }


        /*
        ==================================================
        Field Validation
        ==================================================
        */

        for (
            const [
                fieldName,
                configuration,
            ]
            of Object.entries(
                this.options.fields ?? {},
            )
        ) {

            const exists =
                this.hasOwnProperty(
                    objectValue,
                    fieldName,
                );


            /*
            ==============================================
            Missing Optional Field
            ==============================================
            */

            if (!exists) {

                continue;

            }


            const fieldValue =
                objectValue[fieldName];


            /*
            ==============================================
            Validate Field
            ==============================================
            */

            const result =
                configuration.validator.validate(

                    fieldValue,

                    context,

                );


            /*
            ==============================================
            Sync Result
            ==============================================
            */

            if (
                result instanceof Promise
            ) {

                issues.push(

                    this.createIssue(

                        fieldName,

                        "object.asyncValidator",

                        `Validator for ${fieldName} returned a Promise. Use validateAsync().`,

                    ),

                );


                if (
                    this.options.failFast
                ) {

                    break;

                }


                continue;

            }


            /*
            ==============================================
            Map Issues
            ==============================================
            */

            for (
                const issue
                of result.issues
            ) {

                issues.push(

                    this.prefixIssue(
                        issue,
                        fieldName,
                    ),

                );

            }


            /*
            ==============================================
            Map Warnings
            ==============================================
            */

            for (
                const warning
                of result.warnings
            ) {

                warnings.push(

                    this.prefixWarning(
                        warning,
                        fieldName,
                    ),

                );

            }


            /*
            ==============================================
            Fail Fast
            ==============================================
            */

            if (
                this.options.failFast &&
                !result.valid
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
    Async Validate
    ======================================================
    */

    public async validateAsync(
        value: unknown,
        context?: ValidationContext,
    ): Promise<ValidationResult> {

        const issues: ValidationIssue[] = [];

        const warnings: ValidationWarning[] = [];


        /*
        ==================================================
        Type
        ==================================================
        */

        if (!this.isObject(value)) {

            issues.push(

                this.createIssue(

                    "",

                    "object",

                    "Value must be an object.",

                ),

            );

            return this.createResult(
                issues,
                warnings,
            );

        }


        const objectValue =
            value as Record<string, unknown>;


        /*
        ==================================================
        Required Fields
        ==================================================
        */

        const requiredFields =
            new Set<string>(

                this.options.requiredFields ?? [],

            );


        for (
            const [
                fieldName,
                configuration,
            ]
            of Object.entries(
                this.options.fields ?? {},
            )
        ) {

            if (
                configuration.required
            ) {

                requiredFields.add(
                    fieldName,
                );

            }

        }


        for (
            const fieldName
            of requiredFields
        ) {

            if (
                !this.hasOwnProperty(
                    objectValue,
                    fieldName,
                )
            ) {

                issues.push(

                    this.createIssue(

                        fieldName,

                        "required",

                        `${fieldName} is required.`,

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
        Unknown Fields
        ==================================================
        */

        if (
            !this.options.allowUnknown
        ) {

            const knownFields =
                new Set<string>(

                    Object.keys(
                        this.options.fields ?? {},
                    ),

                );


            for (
                const fieldName
                of Object.keys(objectValue)
            ) {

                if (
                    !knownFields.has(
                        fieldName,
                    )
                ) {

                    issues.push(

                        this.createIssue(

                            fieldName,

                            "unknown",

                            `${fieldName} is not allowed.`,

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

        }


        /*
        ==================================================
        Field Validation
        ==================================================
        */

        for (
            const [
                fieldName,
                configuration,
            ]
            of Object.entries(
                this.options.fields ?? {},
            )
        ) {

            if (
                !this.hasOwnProperty(
                    objectValue,
                    fieldName,
                )
            ) {

                continue;

            }


            const fieldValue =
                objectValue[fieldName];


            const result =
                await configuration.validator.validate(

                    fieldValue,

                    context,

                );


            /*
            ==============================================
            Issues
            ==============================================
            */

            for (
                const issue
                of result.issues
            ) {

                issues.push(

                    this.prefixIssue(
                        issue,
                        fieldName,
                    ),

                );

            }


            /*
            ==============================================
            Warnings
            ==============================================
            */

            for (
                const warning
                of result.warnings
            ) {

                warnings.push(

                    this.prefixWarning(
                        warning,
                        fieldName,
                    ),

                );

            }


            /*
            ==============================================
            Fail Fast
            ==============================================
            */

            if (
                this.options.failFast &&
                !result.valid
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
    Object Detection
    ======================================================
    */

    private isObject(
        value: unknown,
    ): boolean {

        return (

            typeof value === "object" &&

            value !== null &&

            !Array.isArray(value)

        );

    }


    /*
    ======================================================
    Own Property
    ======================================================
    */

    private hasOwnProperty(
        value: Record<string, unknown>,
        key: string,
    ): boolean {

        return Object.prototype.hasOwnProperty.call(
            value,
            key,
        );

    }


    /*
    ======================================================
    Prefix Issue
    ======================================================
    */

    private prefixIssue(
        issue: ValidationIssue,
        fieldName: string,
    ): ValidationIssue {

        const path =

            issue.path.length > 0

                ? `${fieldName}.${issue.path}`

                : fieldName;


        return {

            ...issue,

            path,

        };

    }


    /*
    ======================================================
    Prefix Warning
    ======================================================
    */

    private prefixWarning(
        warning: ValidationWarning,
        fieldName: string,
    ): ValidationWarning {

        const path =

            warning.path.length > 0

                ? `${fieldName}.${warning.path}`

                : fieldName;


        return {

            ...warning,

            path,

        };

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

export function createObjectValidator(
    options: ObjectValidatorOptions = {},
): ObjectValidator {

    return new ObjectValidator(
        options,
    );

}
