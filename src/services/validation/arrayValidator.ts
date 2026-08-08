/**
==========================================================
AURA Trade OS
Array Validator
Version : 0.0.7 Alpha
==========================================================
Array Validation Implementation
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

export interface ArrayValidatorOptions<T> {

    /**
     * Minimum number of items.
     */
    readonly minLength?: number;

    /**
     * Maximum number of items.
     */
    readonly maxLength?: number;

    /**
     * Whether an empty array is accepted.
     *
     * Default: true
     */
    readonly allowEmpty?: boolean;

    /**
     * Validator applied to every array item.
     */
    readonly itemValidator?: Validator<T>;

    /**
     * Stop after the first invalid item.
     */
    readonly failFast?: boolean;

}


/*
==========================================================
Array Validator
==========================================================
*/

export class ArrayValidator<T = unknown>
    implements Validator<unknown> {

    private readonly options: ArrayValidatorOptions<T>;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        options: ArrayValidatorOptions<T> = {},
    ) {

        this.options = {
            allowEmpty: true,
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

        if (!Array.isArray(value)) {

            issues.push(
                this.createIssue(
                    "",
                    "array",
                    "Value must be an array.",
                ),
            );

            return this.createResult(
                issues,
                warnings,
            );

        }


        /*
        ==================================================
        Empty Array
        ==================================================
        */

        if (
            !this.options.allowEmpty &&
            value.length === 0
        ) {

            issues.push(
                this.createIssue(
                    "",
                    "array.empty",
                    "Array must not be empty.",
                ),
            );

        }


        /*
        ==================================================
        Minimum Length
        ==================================================
        */

        if (
            this.options.minLength !== undefined &&
            value.length < this.options.minLength
        ) {

            issues.push(
                this.createIssue(
                    "",
                    "array.minLength",
                    `Array must contain at least ${this.options.minLength} item(s).`,
                ),
            );

        }


        /*
        ==================================================
        Maximum Length
        ==================================================
        */

        if (
            this.options.maxLength !== undefined &&
            value.length > this.options.maxLength
        ) {

            issues.push(
                this.createIssue(
                    "",
                    "array.maxLength",
                    `Array must contain at most ${this.options.maxLength} item(s).`,
                ),
            );

        }


        /*
        ==================================================
        Item Validation
        ==================================================
        */

        if (
            this.options.itemValidator !== undefined
        ) {

            for (
                let index = 0;
                index < value.length;
                index++
            ) {

                const item = value[index];

                const result =
                    this.options.itemValidator.validate(
                        item as T,
                        context,
                    );

                /*
                ==========================================
                Async validator protection
                ==========================================
                */

                if (
                    result instanceof Promise
                ) {

                    /*
                    --------------------------------------
                    The synchronous Validator contract
                    cannot safely consume an async result.
                    --------------------------------------
                    */

                    issues.push(
                        this.createIssue(
                            `[${index}]`,
                            "array.asyncValidator",
                            "Array item validator returned a Promise. Use validateAsync().",
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
                ==========================================
                Map Item Issues
                ==========================================
                */

                for (
                    const issue of result.issues
                ) {

                    issues.push(
                        this.prefixIssue(
                            issue,
                            index,
                        ),
                    );

                }


                /*
                ==========================================
                Fail Fast
                ==========================================
                */

                if (
                    this.options.failFast &&
                    !result.valid
                ) {

                    break;

                }

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

        if (!Array.isArray(value)) {

            issues.push(
                this.createIssue(
                    "",
                    "array",
                    "Value must be an array.",
                ),
            );

            return this.createResult(
                issues,
                warnings,
            );

        }


        /*
        ==================================================
        Empty Array
        ==================================================
        */

        if (
            !this.options.allowEmpty &&
            value.length === 0
        ) {

            issues.push(
                this.createIssue(
                    "",
                    "array.empty",
                    "Array must not be empty.",
                ),
            );

        }


        /*
        ==================================================
        Minimum Length
        ==================================================
        */

        if (
            this.options.minLength !== undefined &&
            value.length < this.options.minLength
        ) {

            issues.push(
                this.createIssue(
                    "",
                    "array.minLength",
                    `Array must contain at least ${this.options.minLength} item(s).`,
                ),
            );

        }


        /*
        ==================================================
        Maximum Length
        ==================================================
        */

        if (
            this.options.maxLength !== undefined &&
            value.length > this.options.maxLength
        ) {

            issues.push(
                this.createIssue(
                    "",
                    "array.maxLength",
                    `Array must contain at most ${this.options.maxLength} item(s).`,
                ),
            );

        }


        /*
        ==================================================
        Item Validator
        ==================================================
        */

        if (
            this.options.itemValidator !== undefined
        ) {

            for (
                let index = 0;
                index < value.length;
                index++
            ) {

                const item = value[index];

                const result =
                    await this.options.itemValidator.validate(
                        item as T,
                        context,
                    );

                for (
                    const issue of result.issues
                ) {

                    issues.push(
                        this.prefixIssue(
                            issue,
                            index,
                        ),
                    );

                }


                if (
                    this.options.failFast &&
                    !result.valid
                ) {

                    break;

                }

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
    Prefix Issue
    ======================================================
    */

    private prefixIssue(
        issue: ValidationIssue,
        index: number,
    ): ValidationIssue {

        const path =
            issue.path.length > 0
                ? `[${index}].${issue.path}`
                : `[${index}]`;

        return {

            ...issue,

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

            issueCount: issues.length,

            warningCount: warnings.length,

        };

    }

}


/*
==========================================================
Factory
==========================================================
*/

export function createArrayValidator<T = unknown>(
    options: ArrayValidatorOptions<T> = {},
): ArrayValidator<T> {

    return new ArrayValidator<T>(
        options,
    );

}
