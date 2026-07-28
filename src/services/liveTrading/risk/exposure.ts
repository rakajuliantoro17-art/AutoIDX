/**
==========================================================
AURA Trade OS
Live Trading Exposure Manager
Version : 0.1.0 Alpha
==========================================================
Portfolio Risk Exposure Calculation Layer
==========================================================
*/


import type {

    LivePosition,

    ExposureReport

}

from "../types";







export class ExposureManager {



    private positions:LivePosition[] = [];







    private maxExposure:number;









    constructor(

        maxExposure:number = 0.5

    ){



        /**
         * Default:
         * Maximum 50% capital exposure
         */

        this.maxExposure =

            maxExposure;



    }









    /**
     * Update current positions
     */
    updatePositions(

        positions:LivePosition[]

    ){



        this.positions =

            positions;



    }









    /**
     * Calculate total exposure
     */
    calculate(

        totalBalance:number

    ):ExposureReport {



        const totalPositionValue =

            this.positions.reduce(

                (

                    total,

                    position

                ) => {



                    return (

                        total

                        +

                        (

                            position.quantity

                            *

                            position.currentPrice

                        )

                    );


                },

                0

            );








        const ratio =

            totalBalance > 0

            ?

            totalPositionValue /

            totalBalance

            :

            0;








        return {


            totalValue:

                totalPositionValue,



            ratio,



            percentage:

                ratio * 100,



            allowed:

                ratio <=

                this.maxExposure,



            timestamp:

                Date.now()



        };


    }









    /**
     * Check new order impact
     */
    canAddExposure(

        balance:number,

        orderValue:number

    ):boolean {



        const current =

            this.calculate(

                balance

            );







        const futureExposure =



            current.totalValue

            +

            orderValue;







        const futureRatio =



            futureExposure /

            balance;








        return (

            futureRatio

            <=

            this.maxExposure

        );


    }









    /**
     * Get limit
     */
    getLimit(){



        return this.maxExposure;


    }









    /**
     * Change exposure limit
     */
    setLimit(

        value:number

    ){



        if(

            value <= 0

            ||

            value > 1

        ){


            throw new Error(

                "Exposure limit must be between 0 and 1"

            );


        }







        this.maxExposure =

            value;


    }



}








const exposureManager =

    new ExposureManager();





export default exposureManager;
