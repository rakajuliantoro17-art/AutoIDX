/**
==========================================================
AURA Trade OS
Request ID Middleware
Version : 0.2.0 Alpha
==========================================================
Request Correlation Middleware
==========================================================
*/

import {

    randomUUID,

} from "crypto";





/*
==========================================================
Types
==========================================================
*/

export interface RequestIdContext {

    requestId: string;

}





/*
==========================================================
Middleware
==========================================================
*/

export class RequestIdMiddleware {

    /*
    ======================================================
    Generate
    ======================================================
    */

    public generate():

        RequestIdContext {

        return {

            requestId:

                randomUUID(),

        };

    }





    /*
    ======================================================
    Header
    ======================================================
    */

    public responseHeaders(

        requestId: string,

    ): Record<string, string> {

        return {

            "X-Request-ID":

                requestId,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const requestIdMiddleware =

    new RequestIdMiddleware();
```

