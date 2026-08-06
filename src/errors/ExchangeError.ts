/**
==========================================================
AURA Trade OS
Exchange Error
Version : 0.1.0 Alpha
==========================================================
Exchange Error Class
==========================================================
*/


/*
==========================================================
Exchange Error Code
==========================================================
*/

export type ExchangeErrorCode =

    | "AUTHENTICATION_ERROR"

    | "INVALID_SIGNATURE"

    | "INVALID_API_KEY"

    | "INSUFFICIENT_BALANCE"

    | "INVALID_ORDER"

    | "ORDER_NOT_FOUND"

    | "MARKET_CLOSED"

    | "RATE_LIMIT"

    | "NETWORK_ERROR"

    | "TIMEOUT"

    | "SERVER_ERROR"

    | "UNKNOWN";





/*
==========================================================
Exchange Error
==========================================================
*/

export class ExchangeError extends Error {

    public readonly code: ExchangeErrorCode;

    public readonly exchange: string;

    public readonly statusCode?: number;

    public readonly timestamp: number;

    public readonly details?: unknown;



    constructor({

        message,

        code = "UNKNOWN",

        exchange = "UNKNOWN",

        statusCode,

        details,

    }: {

        message: string;

        code?: ExchangeErrorCode;

        exchange?: string;

        statusCode?: number;

        details?: unknown;

    }) {

        super(message);

        this.name = "ExchangeError";

        this.code = code;

        this.exchange = exchange;

        this.statusCode = statusCode;

        this.details = details;

        this.timestamp = Date.now();



        Object.setPrototypeOf(

            this,

            ExchangeError.prototype

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

            exchange: this.exchange,

            statusCode: this.statusCode,

            timestamp: this.timestamp,

            details: this.details,

        };

    }

}

