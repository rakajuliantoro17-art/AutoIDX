/**
==========================================================
AURA Trade OS
Logging Middleware
Version : 0.2.0 Alpha
==========================================================
HTTP Logging Middleware
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface LoggingRequest {

    method: string;

    path: string;

    ip?: string;

}





export interface LoggingResponse {

    status: number;

    durationMS: number;

}





/*
==========================================================
Middleware
==========================================================
*/

export class LoggingMiddleware {

    /*
    ======================================================
    Request
    ======================================================
    */

    public logRequest(

        request: LoggingRequest,

    ): number {

        const started =

            Date.now();



        logger.info(

            `[${request.method}] ${request.path}`,

            {

                ip:

                    request.ip,

            },

        );



        return started;

    }





    /*
    ======================================================
    Response
    ======================================================
    */

    public logResponse(

        request: LoggingRequest,

        response: LoggingResponse,

    ): void {

        logger.info(

            `[${request.method}] ${request.path} ${response.status}`,

            {

                durationMS:

                    response.durationMS,

            },

        );

    }





    /*
    ======================================================
    Error
    ======================================================
    */

    public logError(

        request: LoggingRequest,

        error: unknown,

    ): void {

        logger.error(

            `[${request.method}] ${request.path}`,

            error,

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const loggingMiddleware =

    new LoggingMiddleware();
```

