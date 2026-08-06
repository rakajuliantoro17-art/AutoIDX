/**
==========================================================
AURA Trade OS
Retry Policy
Version : 0.3.0 Alpha
==========================================================
Generic Retry Engine
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface RetryOptions {

    attempts?: number;

    delay?: number;

    backoff?: number;

}





/*
==========================================================
Retry Policy
==========================================================
*/

export class RetryPolicy {

    /*
    ======================================================
    Execute
    ======================================================
    */

    public async execute<T>(

        operation: () => Promise<T>,

        options: RetryOptions = {},

    ): Promise<T> {

        const {

            attempts = 3,

            delay = 1000,

            backoff = 2,

        } = options;



        let currentDelay = delay;

        let lastError: unknown;



        for (

            let attempt = 1;

            attempt <= attempts;

            attempt++

        ) {

            try {

                return await operation();

            }

            catch (error) {

                lastError = error;



                logger.warn(

                    `Retry ${attempt}/${attempts}`,

                );



                if (

                    attempt === attempts

                ) {

                    break;

                }



                await new Promise(

                    resolve =>

                        setTimeout(

                            resolve,

                            currentDelay,

                        ),

                );



                currentDelay *= backoff;

            }

        }



        throw lastError;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const retryPolicy =

    new RetryPolicy();

