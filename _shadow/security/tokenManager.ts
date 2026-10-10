/**
==========================================================
AURA Trade OS
Token Manager
Version : 0.1.0 Alpha
==========================================================
Access Token Management
==========================================================
*/

import { randomUUID } from "crypto";

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface TokenPayload {

    userId: string;

    role: string;

    issuedAt: number;

    expiresAt: number;

}





export interface TokenRecord {

    token: string;

    payload: TokenPayload;

}





/*
==========================================================
Token Manager
==========================================================
*/

export class TokenManager {

    private readonly tokens =

        new Map<string, TokenPayload>();



    private readonly defaultTTL =

        60 * 60 * 1000;





    /*
    ======================================================
    Generate
    ======================================================
    */

    public generate(

        userId: string,

        role: string,

        ttl = this.defaultTTL,

    ): TokenRecord {

        const now = Date.now();

        const token = randomUUID();



        const payload: TokenPayload = {

            userId,

            role,

            issuedAt: now,

            expiresAt: now + ttl,

        };



        this.tokens.set(

            token,

            payload,

        );



        logger.info(

            "Access token generated.",

            {

                userId,

                role,

            },

        );



        return {

            token,

            payload,

        };

    }





    /*
    ======================================================
    Validate
    ======================================================
    */

    public validate(

        token?: string,

    ): boolean {

        if (!token) {

            return false;

        }



        const payload =

            this.tokens.get(token);



        if (!payload) {

            return false;

        }



        if (

            Date.now() >

            payload.expiresAt

        ) {

            this.tokens.delete(

                token,

            );



            return false;

        }



        return true;

    }





    /*
    ======================================================
    Payload
    ======================================================
    */

    public payload(

        token: string,

    ): TokenPayload | undefined {

        if (

            !this.validate(token)

        ) {

            return undefined;

        }



        return this.tokens.get(

            token,

        );

    }





    /*
    ======================================================
    Revoke
    ======================================================
    */

    public revoke(

        token: string,

    ): void {

        this.tokens.delete(

            token,

        );



        logger.info(

            "Access token revoked.",

        );

    }





    /*
    ======================================================
    Revoke User
    ======================================================
    */

    public revokeUser(

        userId: string,

    ): void {

        for (

            const [

                token,

                payload,

            ] of this.tokens

        ) {

            if (

                payload.userId ===

                userId

            ) {

                this.tokens.delete(

                    token,

                );

            }

        }

    }





    /*
    ======================================================
    Cleanup
    ======================================================
    */

    public cleanup(): void {

        const now = Date.now();



        for (

            const [

                token,

                payload,

            ] of this.tokens

        ) {

            if (

                now >

                payload.expiresAt

            ) {

                this.tokens.delete(

                    token,

                );

            }

        }

    }





    /*
    ======================================================
    Active Tokens
    ======================================================
    */

    public count(): number {

        return this.tokens.size;

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

export const tokenManager =

    new TokenManager();

