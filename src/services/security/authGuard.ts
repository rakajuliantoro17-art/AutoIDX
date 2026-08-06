/**
==========================================================
AURA Trade OS
Authentication Guard
Version : 0.1.0 Alpha
==========================================================
Authentication Layer
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface AuthUser {

    id: string;

    email: string;

    role: string;

    active: boolean;

}





export interface AuthRequest {

    token?: string;

    apiKey?: string;

}





export interface AuthResult {

    authenticated: boolean;

    user?: AuthUser;

    message: string;

}





/*
==========================================================
Authentication Guard
==========================================================
*/

export class AuthGuard {

    /*
    ======================================================
    Authenticate
    ======================================================
    */

    public authenticate(

        request: AuthRequest,

    ): AuthResult {

        if (

            !request.token &&

            !request.apiKey

        ) {

            logger.warn(

                "Authentication failed.",

            );



            return {

                authenticated: false,

                message:

                    "Authentication required.",

            };

        }



        /*
        ==================================================
        Phase 20

        JWT Validation

        Firebase Auth

        OAuth

        ==================================================
        */



        return {

            authenticated: true,

            user: {

                id: "local",

                email:

                    "system@localhost",

                role: "OWNER",

                active: true,

            },

            message:

                "Authenticated.",

        };

    }





    /*
    ======================================================
    Token
    ======================================================
    */

    public validateToken(

        token?: string,

    ): boolean {

        return Boolean(

            token?.trim(),

        );

    }





    /*
    ======================================================
    API Key
    ======================================================
    */

    public validateApiKey(

        apiKey?: string,

    ): boolean {

        return Boolean(

            apiKey?.trim(),

        );

    }





    /*
    ======================================================
    Active
    ======================================================
    */

    public isActive(

        user?: AuthUser,

    ): boolean {

        return Boolean(

            user?.active,

        );

    }





    /*
    ======================================================
    Logout

    Placeholder

    ======================================================
    */

    public logout(): void {

        logger.info(

            "User logged out.",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const authGuard =

    new AuthGuard();

