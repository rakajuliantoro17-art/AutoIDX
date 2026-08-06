/**
==========================================================
AURA Trade OS
Validation Result
Version : 0.3.0 Alpha
==========================================================
Validation Result Model
==========================================================
*/

export interface ValidationIssue {

    readonly path: string;

    readonly message: string;

}





export interface ValidationWarning {

    readonly path: string;

    readonly message: string;

}





export interface ValidationResult {

    readonly valid: boolean;





    readonly issues:

        readonly ValidationIssue[];





    readonly warnings:

        readonly ValidationWarning[];

}

