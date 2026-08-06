/**
==========================================================
AURA Trade OS
Validation Schema
Version : 0.3.0 Alpha
==========================================================
Validation Schema
==========================================================
*/

export type ValidationRule =

    | "required"

    | "string"

    | "number"

    | "boolean"

    | "array"

    | "object"

    | "email"

    | "min"

    | "max"

    | "pattern";





export interface SchemaField {

    readonly name: string;





    readonly rules:

        readonly ValidationRule[];





    readonly options?:

        Readonly<Record<string, unknown>>;

}





export interface Schema {

    readonly fields:

        readonly SchemaField[];

}


