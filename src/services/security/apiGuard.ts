/**
==========================================================
AURA Trade OS
API Guard
Version : 0.1.0 Alpha
==========================================================
API Security Layer
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface ApiGuardRequest {

    method: string;

    ip?: string;

    userAgent?: string;

    apiKey?: string;

    timestamp?: number;

}





export interface ApiGuardResult {

    success: boolean;

    status: number;

    message: string;

}





/*
==========================================================
API Guard
==========================================================
*/

export class ApiGuard {

    private readonly allowedMethods = [

        "GET",

        "POST",

        "PUT",

        "DELETE",

    ];





    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(

        request: ApiGuardRequest,

    ): ApiGuardResult {

        if (

            !this.validateMethod(

                request.method,

            )

        ) {

            return {

                success: false,

                status: 405,

                message:

                    "Method not allowed.",

            };

        }



        if (

            !this.validateApiKey(

                request.apiKey,

            )

        ) {

            logger.warn(

                "Invalid API Key.",

            );



            return {

                success: false,

                status: 401,

                message:

                    "Unauthorized.",

            };

        }



        return {

            success: true,

            status: 200,

            message: "OK",

        };

    }





    /*
    ======================================================
    Method
    ======================================================
    */

    private validateMethod(

        method: string,

    ): boolean {

        return this.allowedMethods.includes(

            method.toUpperCase(),

        );

    }





    /*
    ======================================================
    API Key
    ======================================================
    */

    private validateApiKey(

        apiKey?: string,

    ): boolean {

        const expected =

            process.env.API_SECRET;



        if (!expected) {

            logger.warn(

                "API_SECRET not configured.",

            );



            return true;

        }



        return apiKey === expected;

    }





    /*
    ======================================================
    Timestamp
    ======================================================
    */

    public validateTimestamp(

        timestamp?: number,

        toleranceMS =

            300000,

    ): boolean {

        if (!timestamp) {

            return false;

        }



        return (

            Math.abs(

                Date.now() -

                timestamp,

            ) <= toleranceMS

        );

    }





    /*
    ======================================================
    User Agent
    ======================================================
    */

    public validateUserAgent(

        userAgent?: string,

    ): boolean {

        return Boolean(

            userAgent?.trim(),

        );

    }





    /*
    ======================================================
    IP
    ======================================================
    */

    public validateIP(

        ip?: string,

    ): boolean {

        return Boolean(

            ip?.trim(),

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const apiGuard =

    new ApiGuard();

