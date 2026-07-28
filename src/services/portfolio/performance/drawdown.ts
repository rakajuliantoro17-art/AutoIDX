/**
==========================================================
AURA Trade OS
Portfolio Drawdown Calculator
Version : 0.1.0 Alpha
==========================================================
*/


export interface DrawdownPoint {

    timestamp:number;

    equity:number;

}



export interface DrawdownResult {

    currentDrawdown:number;

    maximumDrawdown:number;

    peakEquity:number;

    troughEquity:number;

    peakTimestamp:number;

    troughTimestamp:number;

}



export class DrawdownCalculator {


    /**
     * Calculate current and maximum drawdown.
     */
    calculate(

        history:DrawdownPoint[]

    ):DrawdownResult {


        if(

            history.length === 0

        ){

            return {

                currentDrawdown:0,

                maximumDrawdown:0,

                peakEquity:0,

                troughEquity:0,

                peakTimestamp:0,

                troughTimestamp:0,

            };

        }



        let peak =

            history[0].equity;



        let peakTimestamp =

            history[0].timestamp;



        let trough =

            history[0].equity;



        let troughTimestamp =

            history[0].timestamp;



        let maximumDrawdown =

            0;



        let currentDrawdown =

            0;



        for(

            const point of history

        ){


            if(

                point.equity >

                peak

            ){

                peak =

                    point.equity;



                peakTimestamp =

                    point.timestamp;



                trough =

                    point.equity;



                troughTimestamp =

                    point.timestamp;

            }



            const drawdown =

                (

                    (

                        point.equity -

                        peak

                    )

                    /

                    peak

                )

                * 100;



            if(

                point.equity <

                trough

            ){

                trough =

                    point.equity;



                troughTimestamp =

                    point.timestamp;

            }



            if(

                drawdown <

                maximumDrawdown

            ){

                maximumDrawdown =

                    drawdown;

            }



            currentDrawdown =

                drawdown;

        }



        return {


            currentDrawdown:

                Number(

                    currentDrawdown.toFixed(2)

                ),



            maximumDrawdown:

                Number(

                    maximumDrawdown.toFixed(2)

                ),



            peakEquity:

                peak,



            troughEquity:

                trough,



            peakTimestamp,



            troughTimestamp,

        };

    }

}



const drawdownCalculator =

    new DrawdownCalculator();



export default drawdownCalculator;
