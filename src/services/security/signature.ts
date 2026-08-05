/**
==========================================================
AURA Trade OS
Signature Service
Version : 0.1.0 Alpha
==========================================================
HMAC Digital Signature
==========================================================
*/

import {

    createHmac,

    timingSafeEqual,

} from "crypto";

import { logger } from "@/services/logger";





/*
==========================================================
Algorithms
==========================================================
*/

export type SignatureAlgorithm =

    | "sha256"

    | "sha512";





/*
==========================================================
Signature Service
==========================================================
*/

export class SignatureService {

    private readonly defaultAlgorithm:

        SignatureAlgorithm =

        "sha512";





    /*
    ======================================================
    Create Signature
    ======================================================
    */

    public sign(

        payload: string,

        secret: string,

        algorithm:

            SignatureAlgorithm =

            this.defaultAlgorithm,

    ): string {

        return createHmac(

            algorithm,

            secret,

        )

            .update(payload)

            .digest("hex");

    }





    /*
    ======================================================
    Verify Signature
    ======================================================
    */

    public verify(

        payload: string,

        signature: string,

        secret: string,

        algorithm:

            SignatureAlgorithm =

            this.defaultAlgorithm,

    ): boolean {

        const expected =

            this.sign(

                payload,

                secret,

                algorithm,

            );



        try {

            return timingSafeEqual(

                Buffer.from(expected),

                Buffer.from(signature),

            );

        }

        catch {

            return false;

        }

    }





    /*
    ======================================================
    Verify Or Throw
    ======================================================
    */

    public require(

        payload: string,

        signature: string,

        secret: string,

        algorithm:

            SignatureAlgorithm =

            this.defaultAlgorithm,

    ): void {

        if (

            !this.verify(

                payload,

                signature,

                secret,

                algorithm,

            )

        ) {

            logger.warn(

                "Invalid digital signature.",

            );



            throw new Error(

                "Signature verification failed.",

            );

        }

    }





    /*
    ======================================================
    Supported Algorithms
    ======================================================
    */

    public algorithms():

        SignatureAlgorithm[] {

        return [

            "sha256",

            "sha512",

        ];

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const signatureService =

    new SignatureService();
```

