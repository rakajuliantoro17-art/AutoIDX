/**
==========================================================
AURA Trade OS
Live Trading Position Limit Manager
Version : 0.1.0 Alpha
==========================================================
Single Asset Risk Control Layer
==========================================================
*/


import type {

    LivePosition,

    PositionLimitResult

}

from "../types";








export class PositionLimitManager {



    private maxPositionPercent:number;



    private positions:LivePosition[] = [];









    constructor(

        maxPositionPercent:number = 20

    ){



        /**
         * Default:
         * Maximum 20% capital per asset
         */

        this.maxPositionPercent =

            maxPositionPercent;



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
     * Check new position size
     */
    check(

        symbol:string,

        orderValue:number,

        totalBalance:number

    ):PositionLimitResult {



        const currentValue =

            this.getPositionValue(

                symbol

            );







        const futureValue =



            currentValue

            +

            orderValue;







        const percentage =



            (

                futureValue /

                totalBalance

            )

            *

            100;








        const allowed =

            percentage <=

            this.maxPositionPercent;








        return {



            symbol,


            currentValue,


            futureValue,


            percentage,


            allowed,



            reason:

                allowed

                ?

                "Position size accepted"

                :

                "Position limit exceeded",



            timestamp:

                Date.now()



        };


    }









    /**
     * Get existing position value
     */
    private getPositionValue(

        symbol:string

    ){



        const position =

            this.positions.find(

                item =>

                item.symbol === symbol

            );







        if(!position)

            return 0;








        return (

            position.quantity

            *

            position.currentPrice

        );



    }









    /**
     * Update maximum limit
     */
    setLimit(

        percent:number

    ){



        if(

            percent <= 0

            ||

            percent > 100

        ){


            throw new Error(

                "Invalid position limit"

            );


        }







        this.maxPositionPercent =

            percent;



    }









    /**
     * Get current limit
     */
    getLimit(){



        return this.maxPositionPercent;


    }



}







const positionLimit =

    new PositionLimitManager();





export default positionLimit;
