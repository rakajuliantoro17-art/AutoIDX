/**
==========================================================
AURA Trade OS
Intelligence Manager
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    IntelligenceProvider,
    IntelligenceSnapshot,

} from "./types";



export class IntelligenceManager {

    private readonly providers =

        new Map<

            string,

            IntelligenceProvider

        >();



    /**
     * Register provider.
     */
    register(

        provider: IntelligenceProvider

    ): void {

        this.providers.set(

            provider.id,

            provider

        );

    }



    /**
     * Unregister provider.
     */
    unregister(

        providerId: string

    ): boolean {

        return this.providers.delete(

            providerId

        );

    }



    /**
     * Get provider.
     */
    get(

        providerId: string

    ): IntelligenceProvider | undefined {

        return this.providers.get(

            providerId

        );

    }



    /**
     * List providers.
     */
    list(): IntelligenceProvider[] {

        return [

            ...this.providers.values()

        ];

    }



    /**
     * Health check.
     */
    async health(): Promise<

        Record<string, boolean>

    > {

        const result:

        Record<string, boolean> = {};



        for (

            const provider

            of

            this.providers.values()

        ) {

            try {

                result[provider.id] =

                    await provider.health();

            }

            catch {

                result[provider.id] =

                    false;

            }

        }



        return result;

    }



    /**
     * Collect intelligence from all providers.
     */
    async collect(): Promise<

        IntelligenceSnapshot

    > {

        const snapshot:

        IntelligenceSnapshot = {

            timestamp:

                Date.now(),

            providers: {},

        };



        for (

            const provider

            of

            this.providers.values()

        ) {

            try {

                snapshot.providers[

                    provider.id

                ] =

                    await provider.fetch();

            }

            catch (

                error

            ) {

                snapshot.providers[

                    provider.id

                ] = {

                    error:

                        error instanceof Error

                            ? error.message

                            : "Unknown error",

                };

            }

        }



        return snapshot;

    }

}



const intelligenceManager =

    new IntelligenceManager();



export default intelligenceManager;
