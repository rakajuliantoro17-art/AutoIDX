/**
==========================================================
AURA Trade OS
Exchange Request Signer
Version : 0.1.1 Alpha
==========================================================
*/

import {

    createHmac,

} from "node:crypto";

export type SignatureAlgorithm =

    | "sha256"
    | "sha384"
    | "sha512";

export class RequestSigner {

    /**
     * Creates HMAC signature.
     */
    static sign(

        payload: string,

        secret: string,

        algorithm: SignatureAlgorithm = "sha512"

    ): string {

        return createHmac(

            algorithm,

            secret

        )

        .update(payload)

        .digest("hex");

    }

    /**
     * SHA256 helper.
     */
    static sha256(

        payload: string,

        secret: string

    ): string {

        return this.sign(

            payload,

            secret,

            "sha256"

        );

    }

    /**
     * SHA384 helper.
     */
    static sha384(

        payload: string,

        secret: string

    ): string {

        return this.sign(

            payload,

            secret,

            "sha384"

        );

    }

    /**
     * SHA512 helper.
     */
    static sha512(

        payload: string,

        secret: string

    ): string {

        return this.sign(

            payload,

            secret,

            "sha512"

        );

    }

}
