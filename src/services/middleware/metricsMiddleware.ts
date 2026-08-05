/**
==========================================================
AURA Trade OS
Metrics Middleware
Version : 0.2.0 Alpha
==========================================================
HTTP Metrics Middleware
==========================================================
*/

import {

    performanceMetrics,

} from "@/services/metrics/performanceMetrics";





/*
==========================================================
Types
==========================================================
*/

export interface MetricsRequest {

    method: string;

    path: string;

}





export interface MetricsResponse {

    status: number;

}





/*
==========================================================
Middleware
==========================================================
*/

export class MetricsMiddleware {

    /*
    ======================================================
    Begin
    ======================================================
    */

    public begin(): number {

        return Date.now();

    }





    /*
    ======================================================
    End
    ======================================================
    */

    public end(

        startedAt: number,

        response: MetricsResponse,

    ): void {

        const duration =

            Date.now() -

            startedAt;



        if (

            response.status < 400

        ) {

            performanceMetrics.recordSuccess(

                duration,

            );

        }

        else {

            performanceMetrics.recordFailure(

                duration,

            );

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const metricsMiddleware =

    new MetricsMiddleware();
```

