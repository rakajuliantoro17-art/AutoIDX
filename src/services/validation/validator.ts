/**
==========================================================
AURA Trade OS
Validator
Version : 0.3.0 Alpha
==========================================================
Validation Contract
==========================================================
*/

export interface ValidationIssue {

    readonly path: string;

    readonly message: string;

}





export interface ValidationResult {

    readonly valid: boolean;

    readonly issues:

        readonly ValidationIssue[];

}





export interface Validator<T = unknown> {

    /*
    ======================================================
    Validate
    ======================================================
    */

    validate(

        value: T,

    ): ValidationResult;

}


