/**
==========================================================
AURA Trade OS
Trading Error
Version : 0.1.0 Alpha
==========================================================
Trading Error Class
==========================================================
*/


/*
==========================================================
Trading Error Code
==========================================================
*/

export type TradingErrorCode =

    | "INVALID_SIGNAL"

    | "LOW_CONFIDENCE"

    | "POSITION_LIMIT"

    | "EXPOSURE_LIMIT"

    | "INSUFFICIENT_FUNDS"

    | "INVALID_QUANTITY"

    | "INVALID_PRICE"

    | "INVALID_ORDER"

    | "RISK_REJECTED"

    | "MARKET_NOT_READY"

    | "ENGINE_STOPPED"

    | "STRATEGY_DISABLED"

    | "COOLDOWN_ACTIVE"

    | "DAILY_LOSS_LIMIT"

    | "UNKNOWN";





/*
==========================================================
Trading Error
==========================================================
*/

export class TradingError extends Error {

    public readonly code: TradingErrorCode;

    public readonly symbol?: string;

    public readonly strategy?: string;

    public readonly timestamp: number;

    public readonly details?: unknown;



    constructor({

        message,

        code = "UNKNOWN",

        symbol,

        strategy,

        details,

    }: {

        message: string;

        code?: TradingErrorCode;

        symbol?: string;

        strategy?: string;

        details?: unknown;

    }) {

        super(message);

        this.name = "TradingError";

        this.code = code;

        this.symbol = symbol;

        this.strategy = strategy;

        this.details = details;

        this.timestamp = Date.now();

        Object.setPrototypeOf(

            this,

            TradingError.prototype

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

            symbol: this.symbol,

            strategy: this.strategy,

            timestamp: this.timestamp,

            details: this.details,

        };

    }

}
```

