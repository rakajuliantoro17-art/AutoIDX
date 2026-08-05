/**
==========================================================
AURA Trade OS
Validation Error
Version : 0.1.0 Alpha
==========================================================
Validation Error Class
==========================================================
*/


/*
==========================================================
Validation Error Code
==========================================================
*/

export type ValidationErrorCode =

    | "REQUIRED_FIELD"

    | "INVALID_TYPE"

    | "INVALID_FORMAT"

    | "INVALID_VALUE"

    | "OUT_OF_RANGE"

    | "INVALID_SYMBOL"

    | "INVALID_PAIR"

    | "INVALID_PRICE"

    | "INVALID_QUANTITY"

    | "INVALID_TIMEFRAME"

    | "INVALID_PARAMETER"

    | "UNKNOWN";





/*
==========================================================
Validation Error
==========================================================
*/

export class ValidationError extends Error {

    public readonly code: ValidationErrorCode;

    public readonly field?: string;

    public readonly value?: unknown;

    public readonly timestamp: number;

    public readonly details?: unknown;



    constructor({

        message,

        code = "UNKNOWN",

        field,

        value,

        details,

    }: {

        message: string;

        code?: ValidationErrorCode;

        field?: string;

        value?: unknown;

        details?: unknown;

    }) {

        super(message);

        this.name = "ValidationError";

        this.code = code;

        this.field = field;

        this.value = value;

        this.details = details;

        this.timestamp = Date.now();

        Object.setPrototypeOf(

            this,

            ValidationError.prototype

        );

    }





    /*
    ==========================================================
    Serialize
    ==========================================================
    */

    public toJSON() {

        return {

            name: this.name,

            message: this.message,

            code: this.code,

            field: this.field,

            value: this.value,

            timestamp: this.timestamp,

            details: this.details,

        };

    }

}
```

