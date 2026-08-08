/**
==========================================================
AURA Trade OS
Validation Factory
Version : 0.0.7 Alpha
==========================================================
Validation Validator Factory
==========================================================
*/

import type {
    Validator,
} from "./validator";

import type {
    Schema,
} from "./schema";

import {
    SchemaValidator,
} from "./schemaValidator";

import {
    ObjectValidator,
} from "./objectValidator";

import type {
    ObjectValidatorOptions,
} from "./objectValidator";

import {
    ArrayValidator,
} from "./arrayValidator";

import type {
    ArrayValidatorOptions,
} from "./arrayValidator";

import {
    PrimitiveValidator,
} from "./primitiveValidator";

import type {
    PrimitiveValidatorOptions,
} from "./primitiveValidator";


/*
==========================================================
Validation Factory Types
==========================================================
*/

export type ValidationValidatorType =

    | "schema"

    | "object"

    | "array"

    | "primitive";


/*
==========================================================
Factory Configuration
==========================================================
*/

export interface SchemaValidatorConfig {

    readonly type: "schema";

    readonly schema: Schema;

    readonly options?: {

        readonly failFast?: boolean;

        readonly stopOnFieldError?: boolean;

    };

}


export interface ObjectValidatorConfig {

    readonly type: "object";

    readonly options?: ObjectValidatorOptions;

}


export interface ArrayValidatorConfig<T = unknown> {

    readonly type: "array";

    readonly options?: ArrayValidatorOptions<T>;

}


export interface PrimitiveValidatorConfig {

    readonly type: "primitive";

    readonly options?: PrimitiveValidatorOptions;

}


export type ValidationFactoryConfig<T = unknown> =

    | SchemaValidatorConfig

    | ObjectValidatorConfig

    | ArrayValidatorConfig<T>

    | PrimitiveValidatorConfig;


/*
==========================================================
Validation Factory
==========================================================
*/

export class ValidationFactory {

    /*
    ======================================================
    Create
    ======================================================
    */

    public static create<T = unknown>(
        config: ValidationFactoryConfig<T>,
    ): Validator<unknown> {

        switch (config.type) {

            /*
            ==============================================
            Schema
            ==============================================
            */

            case "schema":

                return new SchemaValidator(
                    config.schema,
                    config.options,
                );


            /*
            ==============================================
            Object
            ==============================================
            */

            case "object":

                return new ObjectValidator(
                    config.options,
                );


            /*
            ==============================================
            Array
            ==============================================
            */

            case "array":

                return new ArrayValidator<T>(
                    config.options,
                );


            /*
            ==============================================
            Primitive
            ==============================================
            */

            case "primitive":

                return new PrimitiveValidator(
                    config.options,
                );


            /*
            ==============================================
            Unknown Type
            ==============================================
            */

            default:

                return this.assertNever(
                    config,
                );

        }

    }


    /*
    ======================================================
    Create Primitive
    ======================================================
    */

    public static primitive(
        options: PrimitiveValidatorOptions = {},
    ): PrimitiveValidator {

        return new PrimitiveValidator(
            options,
        );

    }


    /*
    ======================================================
    Create Object
    ======================================================
    */

    public static object(
        options: ObjectValidatorOptions = {},
    ): ObjectValidator {

        return new ObjectValidator(
            options,
        );

    }


    /*
    ======================================================
    Create Array
    ======================================================
    */

    public static array<T = unknown>(
        options: ArrayValidatorOptions<T> = {},
    ): ArrayValidator<T> {

        return new ArrayValidator<T>(
            options,
        );

    }


    /*
    ======================================================
    Create Schema
    ======================================================
    */

    public static schema<T = unknown>(
        schema: Schema,
        options: SchemaValidatorConfig["options"] = {},
    ): SchemaValidator<T> {

        return new SchemaValidator<T>(
            schema,
            options,
        );

    }


    /*
    ======================================================
    Assert Never
    ======================================================
    */

    private static assertNever(
        value: never,
    ): never {

        throw new Error(
            `Unsupported validation type: ${String(value)}`,
        );

    }

}


/*
==========================================================
Factory Function
==========================================================
*/

export function createValidator<T = unknown>(
    config: ValidationFactoryConfig<T>,
): Validator<unknown> {

    return ValidationFactory.create<T>(
        config,
    );

}
