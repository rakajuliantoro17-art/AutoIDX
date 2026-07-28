/**
==========================================================
AURA Trade OS
Intelligence Health Monitor
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    IntelligenceProvider,

} from "../types";



export interface ProviderHealth {

    providerId: string;

    healthy: boolean;

    latency: number;

    lastChecked: number;

    message: string;

}



export interface HealthReport {

    overallHealthy: boolean;

    checkedAt: number;

    providers: ProviderHealth[];

}



export class IntelligenceHealth {

    /**
     * Check every registered provider.
     */
    async check(

        providers: readonly IntelligenceProvider[]

    ): Promise<HealthReport> {

        const results: ProviderHealth[] = [];



        for (

            const provider of providers

        ) {

            const started =

                Date.now();



            try {

                const healthy =

                    await provider.health();



                results.push({

                    providerId:

                        provider.id,

                    healthy,

                    latency:

                        Date.now() -

                        started,

                    lastChecked:

                        Date.now(),

                    message:

                        healthy

                            ? "OK"

                            : "Unavailable",

                });

            }

            catch (

                error

            ) {

                results.push({

                    providerId:

                        provider.id,

                    healthy: false,

                    latency:

                        Date.now() -

                        started,

                    lastChecked:

                        Date.now(),

                    message:

                        error instanceof Error

                            ? error.message

                            : "Unknown error",

                });

            }

        }



        return {

            overallHealthy:

                results.every(

                    provider =>

                        provider.healthy

                ),

            checkedAt:

                Date.now(),

            providers:

                results,

        };

    }

}



const intelligenceHealth =

    new IntelligenceHealth();



export default intelligenceHealth;
