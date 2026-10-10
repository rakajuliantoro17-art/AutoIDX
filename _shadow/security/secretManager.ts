/**
==========================================================
AURA Trade OS
Secret Manager
Version : 0.1.0 Alpha
==========================================================
Central Secret Management
==========================================================
*/

import logger from "@/services/logger";

/*
==========================================================
Secret Keys
==========================================================
*/

export type SecretKey =

    | "INDODAX_API_KEY"

    | "INDODAX_SECRET_KEY"

    | "FIREBASE_API_KEY"

    | "OPENAI_API_KEY"

    | "GEMINI_API_KEY"

    | "TELEGRAM_BOT_TOKEN"

    | "API_SECRET";

/*
==========================================================
Secret Manager
==========================================================
*/

export class SecretManager {

    /*
    ======================================================
    Get Secret
    ======================================================
    */

    public get(

        key: SecretKey,

    ): string {

        const value = process.env[key];

        if (!value) {

            logger.warn(

                `Secret "${key}" not configured.`,

            );

            throw new Error(

                `Missing secret: ${key}`,

            );

        }

        return value;

    }





    /*
    ======================================================
    Optional Secret
    ======================================================
    */

    public optional(

        key: SecretKey,

    ): string | undefined {

        return process.env[key];

    }





    /*
    ======================================================
    Exists
    ======================================================
    */

    public exists(

        key: SecretKey,

    ): boolean {

        return Boolean(

            process.env[key],

        );

    }





    /*
    ======================================================
    Mask

    Example:
    abcdefghijklmnop

    becomes

    abcd********mnop
    ======================================================
    */

    public mask(

        secret: string,

    ): string {

        if (

            secret.length <= 8

        ) {

            return "********";

        }

        return (

            secret.slice(0, 4) +

            "*".repeat(

                secret.length - 8,

            ) +

            secret.slice(-4)

        );

    }





    /*
    ======================================================
    Debug

    Never expose full secrets.
    ======================================================
    */

    public debug(

        key: SecretKey,

    ): string {

        const value =

            this.optional(key);

        if (!value) {

            return "NOT_CONFIGURED";

        }

        return this.mask(value);

    }





    /*
    ======================================================
    Summary
    ======================================================
    */

    public summary() {

        return {

            INDODAX_API_KEY:

                this.exists(

                    "INDODAX_API_KEY",

                ),

            INDODAX_SECRET_KEY:

                this.exists(

                    "INDODAX_SECRET_KEY",

                ),

            FIREBASE_API_KEY:

                this.exists(

                    "FIREBASE_API_KEY",

                ),

            OPENAI_API_KEY:

                this.exists(

                    "OPENAI_API_KEY",

                ),

            GEMINI_API_KEY:

                this.exists(

                    "GEMINI_API_KEY",

                ),

            TELEGRAM_BOT_TOKEN:

                this.exists(

                    "TELEGRAM_BOT_TOKEN",

                ),

            API_SECRET:

                this.exists(

                    "API_SECRET",

                ),

        };

    }

}

/*
==========================================================
Singleton
==========================================================
*/

export const secretManager =

    new SecretManager();

