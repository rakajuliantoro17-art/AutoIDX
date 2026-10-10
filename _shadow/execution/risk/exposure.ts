/**
==========================================================
AURA Trade OS
Exposure Manager
Version : 0.1.0 Alpha
==========================================================
*/

export interface Position {

    symbol: string;

    quantity: number;

    entryPrice: number;

}



export interface ExposureResult {

    currentExposure: number;

    maxExposure: number;

    availableExposure: number;

    utilization: number;

    allowed: boolean;

}



export class ExposureManager {

    constructor(

        private readonly maxExposure: number

    ) {}



    /**
     * Calculate portfolio exposure.
     */
    calculate(

        positions: readonly Position[],

        balance: number

    ): ExposureResult {

        const currentExposure =

            positions.reduce(

                (

                    total,

                    position

                ) =>

                    total +

                    (

                        position.quantity *

                        position.entryPrice

                    ),

                0

            );



        const utilization =

            balance <= 0

                ? 0

                : currentExposure /

                  balance;



        const availableExposure =

            Math.max(

                0,

                this.maxExposure -

                currentExposure

            );



        return {

            currentExposure,

            maxExposure:

                this.maxExposure,

            availableExposure,

            utilization,

            allowed:

                currentExposure <=

                this.maxExposure,

        };

    }



    /**
     * Check whether a new position
     * can be opened.
     */
    canOpen(

        currentExposure: number,

        orderValue: number

    ): boolean {

        return (

            currentExposure +

            orderValue

        ) <= this.maxExposure;

    }

}



const exposure =

    new ExposureManager(

        100_000_000 // Default max exposure
    );



export default exposure;
