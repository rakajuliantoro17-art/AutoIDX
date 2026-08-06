/**
==========================================================
AURA Trade OS
CSRF Guard
Version : 0.1.0 Alpha
==========================================================
Cross-Site Request Forgery Protection
==========================================================
*/

import { randomUUID } from "crypto";

import { logger } from "@/services/logger";



/*
==========================================================
Types
==========================================================
*/

export interface CsrfRequest {

    token?: string;

    sessionId?: string;

}



export interface CsrfResult {

    success: boolean;

    message: string;

}





/*
==========================================================
CSRF Guard
==========================================================
*/

export class CsrfGuard {

    private readonly tokens =

        new Map<string, string>();





    /*
    ======================================================
    Generate
    ======================================================
    */

    public generate(

        sessionId: string,

    ): string {

        const token =

            randomUUID();

        this.tokens.set(

            sessionId,

            token,

        );

        logger.debug(

            "CSRF token generated.",

            {

                sessionId,

            },

        );

        return token;

    }





    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(

        request: CsrfRequest,

    ): CsrfResult {

        if (

            !request.sessionId

        ) {

            return {

                success: false,

                message:

                    "Session not found.",

            };

        }



        const expected =

            this.tokens.get(

                request.sessionId,

            );



        if (

            !expected ||

            expected !== request.token

        ) {

            logger.warn(

                "Invalid CSRF token.",

                {

                    sessionId:

                        request.sessionId,

                },

            );



            return {

                success: false,

                message:

                    "Invalid CSRF token.",

            };

        }



        return {

            success: true,

            message:

                "CSRF validation passed.",

        };

    }





    /*
    ======================================================
    Revoke
    ======================================================
    */

    public revoke(

        sessionId: string,

    ): void {

        this.tokens.delete(

            sessionId,

        );

    }





    /*
    ======================================================
    Exists
    ======================================================
    */

    public exists(

        sessionId: string,

    ): boolean {

        return this.tokens.has(

            sessionId,

        );

    }





    /*
    ======================================================
    Clear

    Development Only
    ======================================================
    */

    public clear(): void {

        this.tokens.clear();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const csrfGuard =

    new CsrfGuard();

