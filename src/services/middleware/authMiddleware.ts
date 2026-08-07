/**
==========================================================
AURA Trade OS
Authentication Middleware
Version : 0.2.0 Alpha
==========================================================
HTTP Authentication Middleware
==========================================================
*/

import {

    authGuard,

} from "@/services/security/authGuard";





/*
==========================================================
Types
==========================================================
*/

export interface AuthRequest {

    authorization?: string;

    method: string;

    path: string;

    ip?: string;

}





export interface AuthResponse {

    success: boolean;

    status: number;

    message: string;

}





/*
==========================================================
Middleware
==========================================================
*/

export class AuthMiddleware {

    /*
    ======================================================
    Handle
    ======================================================
    */

    public async handle(

        request: AuthRequest,

    ): Promise<AuthResponse> {

        const token =

            this.extractToken(

                request.authorization,

            );



        const authorized =

            authGuard.validateToken(

                token,

            );



        if (

            !authorized

        ) {

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

            message: "Authorized.",

        };

    }





    /*
    ======================================================
    Bearer Token
    ======================================================
    */

    private extractToken(

        authorization?: string,

    ): string | undefined {

        if (

            !authorization

        ) {

            return undefined;

        }



        if (

            authorization.startsWith(

                "Bearer ",

            )

        ) {

            return authorization.slice(

                7,

            );

        }



        return authorization;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const authMiddleware =

    new AuthMiddleware();

