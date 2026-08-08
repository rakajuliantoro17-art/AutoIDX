/**
==========================================================
AURA Trade OS
Validation Registry
Version : 0.0.7 Alpha
==========================================================
Validation Registry & Discovery Layer
==========================================================
*/

import type {
    Validator,
} from "./validator";


/*
==========================================================
Types
==========================================================
*/

export type ValidationId = string;

export type ValidationVersion = string;


export interface ValidationRegistryMetadata {

    /**
     * Human-readable validator name.
     */
    readonly name?: string;

    /**
     * Description of the validator.
     */
    readonly description?: string;

    /**
     * Validator version.
     */
    readonly version?: ValidationVersion;

    /**
     * Validator category.
     *
     * Examples:
     *
     * "trade"
     * "market"
     * "risk"
     * "portfolio"
     * "system"
     */
    readonly category?: string;

    /**
     * Arbitrary metadata.
     */
    readonly tags?: readonly string[];

    /**
     * Additional registry metadata.
     */
    readonly metadata?: Readonly<
        Record<string, unknown>
    >;

}


export interface ValidationRegistryEntry {

    /**
     * Unique validator ID.
     */
    readonly id: ValidationId;

    /**
     * Validator implementation.
     */
    readonly validator: Validator<unknown>;

    /**
     * Registry metadata.
     */
    readonly metadata?: ValidationRegistryMetadata;

    /**
     * Registration timestamp.
     */
    readonly registeredAt: number;

}


export interface ValidationRegistryOptions {

    /**
     * Allow replacing an existing validator.
     *
     * Default: false.
     */
    readonly allowOverwrite?: boolean;

    /**
     * Allow aliases to point to another validator.
     *
     * Default: true.
     */
    readonly allowAliases?: boolean;

}


/*
==========================================================
Validation Registry
==========================================================
*/

export class ValidationRegistry {

    private readonly entriesMap:
        Map<
            ValidationId,
            ValidationRegistryEntry
        >;


    private readonly aliases:
        Map<
            ValidationId,
            ValidationId
        >;


    private readonly options:
        ValidationRegistryOptions;


    /*
    ======================================================
    Constructor
    ======================================================
    */

    public constructor(
        options: ValidationRegistryOptions = {},
    ) {

        this.entriesMap =
            new Map<
                ValidationId,
                ValidationRegistryEntry
            >();


        this.aliases =
            new Map<
                ValidationId,
                ValidationId
            >();


        this.options = {

            allowOverwrite: false,

            allowAliases: true,

            ...options,

        };

    }


    /*
    ======================================================
    Register
    ======================================================
    */

    public register(
        id: ValidationId,
        validator: Validator<unknown>,
        metadata?: ValidationRegistryMetadata,
    ): ValidationRegistryEntry {

        this.assertValidId(
            id,
        );


        if (
            this.entriesMap.has(id) &&
            !this.options.allowOverwrite
        ) {

            throw new Error(
                `Validator "${id}" is already registered.`,
            );

        }


        const entry:
            ValidationRegistryEntry = {

            id,

            validator,

            metadata,

            registeredAt: Date.now(),

        };


        this.entriesMap.set(
            id,
            entry,
        );


        /*
        ==================================================
        Remove Conflicting Alias
        ==================================================
        */

        this.aliases.delete(
            id,
        );


        return entry;

    }


    /*
    ======================================================
    Register Alias
    ======================================================
    */

    public registerAlias(
        alias: ValidationId,
        target: ValidationId,
    ): void {

        if (
            !this.options.allowAliases
        ) {

            throw new Error(
                "Validation aliases are disabled.",
            );

        }


        this.assertValidId(
            alias,
        );

        this.assertValidId(
            target,
        );


        if (
            alias === target
        ) {

            throw new Error(
                `Validator alias "${alias}" cannot point to itself.`,
            );

        }


        if (
            this.entriesMap.has(alias)
        ) {

            throw new Error(
                `Cannot create alias "${alias}" because a validator with that ID already exists.`,
            );

        }


        if (
            this.aliases.has(alias)
        ) {

            throw new Error(
                `Validation alias "${alias}" is already registered.`,
            );

        }


        if (
            !this.has(target)
        ) {

            throw new Error(
                `Cannot create alias "${alias}". Target validator "${target}" does not exist.`,
            );

        }


        /*
        ==================================================
        Circular Alias Protection
        ==================================================
        */

        if (
            this.wouldCreateAliasCycle(
                alias,
                target,
            )
        ) {

            throw new Error(
                `Creating alias "${alias}" would create an alias cycle.`,
            );

        }


        this.aliases.set(
            alias,
            target,
        );

    }


    /*
    ======================================================
    Resolve ID
    ======================================================
    */

    public resolve(
        id: ValidationId,
    ): ValidationId {

        this.assertValidId(
            id,
        );


        let current = id;

        const visited =
            new Set<ValidationId>();


        while (
            this.aliases.has(current)
        ) {

            if (
                visited.has(current)
            ) {

                throw new Error(
                    `Circular validation alias detected at "${current}".`,
                );

            }


            visited.add(
                current,
            );


            current =
                this.aliases.get(
                    current,
                ) as ValidationId;

        }


        return current;

    }


    /*
    ======================================================
    Get Validator
    ======================================================
    */

    public get(
        id: ValidationId,
    ): Validator<unknown> {

        const entry =
            this.getEntry(
                id,
            );


        return entry.validator;

    }


    /*
    ======================================================
    Get Entry
    ======================================================
    */

    public getEntry(
        id: ValidationId,
    ): ValidationRegistryEntry {

        const resolvedId =
            this.resolve(
                id,
            );


        const entry =
            this.entriesMap.get(
                resolvedId,
            );


        if (
            entry === undefined
        ) {

            throw new Error(
                `Validator "${id}" is not registered.`,
            );

        }


        return entry;

    }


    /*
    ======================================================
    Try Get
    ======================================================
    */

    public tryGet(
        id: ValidationId,
    ): Validator<unknown> | undefined {

        const entry =
            this.tryGetEntry(
                id,
            );


        return entry?.validator;

    }


    /*
    ======================================================
    Try Get Entry
    ======================================================
    */

    public tryGetEntry(
        id: ValidationId,
    ): ValidationRegistryEntry | undefined {

        const resolvedId =
            this.resolve(
                id,
            );


        return this.entriesMap.get(
            resolvedId,
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

        const resolvedId =
            this.resolve(
                id,
            );


        return this.entriesMap.has(
            resolvedId,
        );

    }


    /*
    ======================================================
    Has Alias
    ======================================================
    */

    public hasAlias(
        alias: ValidationId,
    ): boolean {

        return this.aliases.has(
            alias,
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

        const resolvedId =
            this.resolve(
                id,
            );


        const deleted =
            this.entriesMap.delete(
                resolvedId,
            );


        /*
        ==================================================
        Remove Aliases Pointing To Validator
        ==================================================
        */

        if (
            deleted
        ) {

            for (
                const [
                    alias,
                    target,
                ]
                of this.aliases.entries()
            ) {

                if (
                    target === resolvedId
                ) {

                    this.aliases.delete(
                        alias,
                    );

                }

            }

        }


        return deleted;

    }


    /*
    ======================================================
    Unregister Alias
    ======================================================
    */

    public unregisterAlias(
        alias: ValidationId,
    ): boolean {

        return this.aliases.delete(
            alias,
        );

    }


    /*
    ======================================================
    List IDs
    ======================================================
    */

    public list(): readonly ValidationId[] {

        return Array.from(
            this.entriesMap.keys(),
        );

    }


    /*
    ======================================================
    List Aliases
    ======================================================
    */

    public listAliases():
        Readonly<
            Record<ValidationId, ValidationId>
        > {

        return Object.fromEntries(
            this.aliases.entries(),
        );

    }


    /*
    ======================================================
    List Entries
    ======================================================
    */

    public entries():
        readonly ValidationRegistryEntry[] {

        return Array.from(
            this.entriesMap.values(),
        );

    }


    /*
    ======================================================
    Find By Category
    ======================================================
    */

    public findByCategory(
        category: string,
    ): readonly ValidationRegistryEntry[] {

        return this.entries().filter(
            entry =>
                entry.metadata?.category === category,
        );

    }


    /*
    ======================================================
    Find By Tag
    ======================================================
    */

    public findByTag(
        tag: string,
    ): readonly ValidationRegistryEntry[] {

        return this.entries().filter(
            entry =>
                entry.metadata?.tags?.includes(
                    tag,
                ) === true,
        );

    }


    /*
    ======================================================
    Find
    ======================================================
    */

    public find(
        predicate: (
            entry: ValidationRegistryEntry,
        ) => boolean,
    ): readonly ValidationRegistryEntry[] {

        return this.entries().filter(
            predicate,
        );

    }


    /*
    ======================================================
    Count
    ======================================================
    */

    public get size(): number {

        return this.entriesMap.size;

    }


    /*
    ======================================================
    Alias Count
    ======================================================
    */

    public get aliasCount(): number {

        return this.aliases.size;

    }


    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.entriesMap.clear();

        this.aliases.clear();

    }


    /*
    ======================================================
    Clear Aliases
    ======================================================
    */

    public clearAliases(): void {

        this.aliases.clear();

    }


    /*
    ======================================================
    Alias Cycle Detection
    ======================================================
    */

    private wouldCreateAliasCycle(
        alias: ValidationId,
        target: ValidationId,
    ): boolean {

        let current = target;

        const visited =
            new Set<ValidationId>();


        while (
            this.aliases.has(current)
        ) {

            if (
                current === alias
            ) {

                return true;

            }


            if (
                visited.has(current)
            ) {

                return true;

            }


            visited.add(
                current,
            );


            current =
                this.aliases.get(
                    current,
                ) as ValidationId;

        }


        return current === alias;

    }


    /*
    ======================================================
    Validate ID
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
Default Registry
==========================================================
*/

export const validationRegistry =
    new ValidationRegistry();


/*
==========================================================
Factory
==========================================================
*/

export function createValidationRegistry(
    options: ValidationRegistryOptions = {},
): ValidationRegistry {

    return new ValidationRegistry(
        options,
    );

}
