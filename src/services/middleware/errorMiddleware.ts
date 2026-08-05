/**
==========================================================
AURA Trade OS
Error Middleware
Version : 0.2.0 Alpha
==========================================================
Global Error Middleware
==========================================================
*/

import { logger } from "@/services/logger";

import {

    ExchangeError,

    TradingError,

    ValidationError,

} from "@/errors";





/*
==========================================================
Types
==========================================================
*/

export interface ErrorResponse {

    success: false;

    status: number;

    error: string;

    timestamp: string;

}





/*
==========================================================
Middleware
==========================================================
*/

export class ErrorMiddleware {

    /*
    ======================================================
    Handle
    ======================================================
    */

    public handle(

        error: unknown,

    ): ErrorResponse {

        logger.error(

            "Unhandled exception.",

            error,

        );



        if (

            error instanceof ValidationError

        ) {

            return this.response(

                400,

                error.message,

            );

        }



        if (

            error instanceof ExchangeError

        ) {

            return this.response(

                502,

                error.message,

            );

        }



        if (

            error instanceof TradingError

        ) {

            return this.response(

                500,

                error.message,

            );

        }



        if (

            error instanceof Error

        ) {

            return this.response(

                500,

                error.message,

            );

        }



        return this.response(

            500,

            "Internal Server Error.",

        );

    }





    /*
    ======================================================
    Response
    ======================================================
    */

    private response(

        status: number,

        message: string,

    ): ErrorResponse {

        return {

            success: false,

            status,

            error:

                message,

            timestamp:

                new Date()

                    .toISOString(),

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const errorMiddleware =

    new ErrorMiddleware();
```

