/**
==========================================================
AURA Trade OS
Intelligence Registry
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    IntelligenceProvider,

} from "./types";



export class IntelligenceRegistry {

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

        if (

            this.providers.has(

                provider.id

            )

        ) {

            throw new Error(

                `Provider '${provider.id}' is already registered.`

            );

        }



        this.providers.set(

            provider.id,

            provider

        );

    }



    /**
     * Remove provider.
     */
    unregister(

        providerId: string

    ): boolean {

        return this.providers.delete(

            providerId

        );

    }



    /**
     * Find provider.
     */
    get(

        providerId: string

    ): IntelligenceProvider | undefined {

        return this.providers.get(

            providerId

        );

    }



    /**
     * Check provider existence.
     */
    has(

        providerId: string

    ): boolean {

        return this.providers.has(

            providerId

        );

    }



    /**
     * Get all providers.
     */
    all(): IntelligenceProvider[] {

        return [

            ...this.providers.values()

        ];

    }



    /**
     * Registered provider count.
     */
    count(): number {

        return this.providers.size;

    }



    /**
     * Remove all providers.
     */
    clear(): void {

        this.providers.clear();

    }

}



const intelligenceRegistry =

    new IntelligenceRegistry();



export default intelligenceRegistry;
