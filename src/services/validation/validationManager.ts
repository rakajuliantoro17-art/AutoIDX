/**
==========================================================
AURA Trade OS
Validation Manager
Version : 0.0.7 Alpha
==========================================================
Validation Lifecycle & Execution Manager
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
} from "./validationResult";

import type {
    ValidationFactoryConfig,
} from "./validationFactory";

import {
    ValidationFactory,
} from "./validationFactory";


/*
==========================================================
Types
==========================================================
*/

export type ValidationId = string;


export interface RegisteredValidator {

    readonly id: ValidationId;

    readonly validator: Validator<unknown>;

    readonly metadata?: Readonly<
        Record<string, unknown>
    >;

    readonly createdAt: number;

}


export interface ValidationManagerOptions {

    /**
     * Automatically replace an existing validator
     * when registering the same ID.
     *
     * Default: false.
     */
    readonly allowOverwrite?: boolean;

}


/*
==========================================================
Validation Manager
==========================================================
*/

export class ValidationManager {

    private readonly validators:
        Map<ValidationId, RegisteredValidator>;


    private readonly options:
        ValidationManagerOptions;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        options: ValidationManagerOptions = {},
    ) {

        this.validators =
            new Map<
                ValidationId,
                RegisteredValidator
            >();


        this.options = {

            allowOverwrite: false,

            ...options,

        };

    }


    /*
    ======================================================
    Register Existing Validator
    ======================================================
    */

    public register(
        id: ValidationId,
        validator: Validator<unknown>,
        metadata?: Readonly<
            Record<string, unknown>
        >,
    ): RegisteredValidator {

        this.assertValidId(
            id,
        );


        if (
            this.validators.has(id) &&
            !this.options.allowOverwrite
        ) {

            throw new Error(
                `Validator "${id}" is already registered.`,
            );

        }


        const entry: RegisteredValidator = {

            id,

            validator,

            metadata,

            createdAt: Date.now(),

        };


        this.validators.set(
            id,
            entry,
        );


        return entry;

    }


    /*
    ======================================================
    Register From Factory
    ======================================================
    */

    public registerFactory<T = unknown>(
        id: ValidationId,
        config: ValidationFactoryConfig<T>,
        metadata?: Readonly<
            Record<string, unknown>
        >,
    ): RegisteredValidator {

        const validator =
            ValidationFactory.create<T>(
                config,
            );


        return this.register(
            id,
            validator,
            metadata,
        );

    }


    /*
    ======================================================
    Unregister
    ======================================================
    */

    public unregister(
        id: ValidationId,
    ): boolean {

        return this.validators.delete(
            id,
        );

    }


    /*
    ======================================================
    Has
    ======================================================
    */

    public has(
        id: ValidationId,
    ): boolean {

        return this.validators.has(
            id,
        );

    }


    /*
    ======================================================
    Get
    ======================================================
    */

    public get(
        id: ValidationId,
    ): Validator<unknown> {

        const entry =
            this.validators.get(
                id,
            );


        if (
            entry === undefined
        ) {

            throw new Error(
                `Validator "${id}" is not registered.`,
            );

        }


        return entry.validator;

    }


    /*
    ======================================================
    Get Entry
    ======================================================
    */

    public getEntry(
        id: ValidationId,
    ): RegisteredValidator | undefined {

        return this.validators.get(
            id,
        );

    }


    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(
        id: ValidationId,
        value: unknown,
        context?: ValidationContext,
    ): ValidationResult {

        const validator =
            this.get(id);


        return validator.validate(
            value,
            context,
        );

    }


    /*
    ======================================================
    Validate Async
    ======================================================
    */

    public async validateAsync(
        id: ValidationId,
        value: unknown,
        context?: ValidationContext,
    ): Promise<ValidationResult> {

        const validator =
            this.get(id);


        return await validator.validate(
            value,
            context,
        );

    }


    /*
    ======================================================
    List IDs
    ======================================================
    */

    public list(): readonly ValidationId[] {

        return Array.from(
            this.validators.keys(),
        );

    }


    /*
    ======================================================
    List Entries
    ======================================================
    */

    public entries(): readonly RegisteredValidator[] {

        return Array.from(
            this.validators.values(),
        );

    }


    /*
    ======================================================
    Count
    ======================================================
    */

    public get size(): number {

        return this.validators.size;

    }


    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.validators.clear();

    }


    /*
    ======================================================
    Assert ID
    ======================================================
    */

    private assertValidId(
        id: ValidationId,
    ): void {

        if (
            typeof id !== "string" ||
            id.trim().length === 0
        ) {

            throw new Error(
                "Validation ID must be a non-empty string.",
            );

        }

    }

}


/*
==========================================================
Default Manager
==========================================================
*/

export const validationManager =
    new ValidationManager();


/*
==========================================================
Factory Helper
==========================================================
*/

export function createValidationManager(
    options: ValidationManagerOptions = {},
): ValidationManager {

    return new ValidationManager(
        options,
    );

}
