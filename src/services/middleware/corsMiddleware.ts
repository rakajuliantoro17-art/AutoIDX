/**
==========================================================
AURA Trade OS
CORS Middleware
Version : 0.2.0 Alpha
==========================================================
Cross-Origin Resource Sharing Middleware
==========================================================
*/





/*
==========================================================
Types
==========================================================
*/

export interface CorsRequest {

    origin?: string;

    method: string;

}





export interface CorsOptions {

    allowedOrigins?: string[];

    allowedMethods?: string[];

    allowedHeaders?: string[];

    allowCredentials?: boolean;

}





export interface CorsResponse {

    status: number;

    headers: Record<string, string>;

}





/*
==========================================================
Middleware
==========================================================
*/

export class CorsMiddleware {

    private readonly options:

        Required<CorsOptions> = {

        allowedOrigins: [

            "*",

        ],

        allowedMethods: [

            "GET",

            "POST",

            "PUT",

            "DELETE",

            "OPTIONS",

        ],

        allowedHeaders: [

            "Content-Type",

            "Authorization",

        ],

        allowCredentials:

            false,

    };





    /*
    ======================================================
    Handle
    ======================================================
    */

    public handle(

        request: CorsRequest,

    ): CorsResponse {

        const origin =

            this.resolveOrigin(

                request.origin,

            );



        return {

            status:

                request.method ===

                "OPTIONS"

                    ? 204

                    : 200,

            headers: {

                "Access-Control-Allow-Origin":

                    origin,

                "Access-Control-Allow-Methods":

                    this.options.allowedMethods.join(

                        ", ",

                    ),

                "Access-Control-Allow-Headers":

                    this.options.allowedHeaders.join(

                        ", ",

                    ),

                "Access-Control-Allow-Credentials":

                    String(

                        this.options.allowCredentials,

                    ),

            },

        };

    }





    /*
    ======================================================
    Resolve Origin
    ======================================================
    */

    private resolveOrigin(

        origin?: string,

    ): string {

        if (

            this.options.allowedOrigins.includes(

                "*",

            )

        ) {

            return "*";

        }



        if (

            origin &&

            this.options.allowedOrigins.includes(

                origin,

            )

        ) {

            return origin;

        }



        return this.options.allowedOrigins[0];

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const corsMiddleware =

    new CorsMiddleware();

