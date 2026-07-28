/**
==========================================================
AURA Trade OS
Portfolio Equity Curve
Version : 0.1.0 Alpha
==========================================================
*/


export interface EquityPoint {

    timestamp:number;

    equity:number;

}



export interface EquitySummary {

    startEquity:number;

    currentEquity:number;

    highestEquity:number;

    lowestEquity:number;

    totalReturn:number;

    totalReturnPercent:number;

}



export class EquityCurve {


    private history:

        EquityPoint[];



    constructor(){

        this.history = [];

    }



    /**
     * Add new equity snapshot.
     */
    add(

        equity:number,

        timestamp:number = Date.now()

    ): EquityPoint {


        const point:EquityPoint = {


            timestamp,


            equity,


        };



        this.history.push(

            point

        );



        return point;

    }



    /**
     * Get all equity history.
     */
    getHistory():

        EquityPoint[] {


        return [

            ...this.history

        ];

    }



    /**
     * Get latest equity.
     */
    latest():

        EquityPoint | null {


        if(

            this.history.length === 0

        ){

            return null;

        }



        return (

            this.history[

                this.history.length - 1

            ]

        );

    }



    /**
     * Calculate equity statistics.
     */
    summary():

        EquitySummary {


        if(

            this.history.length === 0

        ){

            return {

                startEquity:0,

                currentEquity:0,

                highestEquity:0,

                lowestEquity:0,

                totalReturn:0,

                totalReturnPercent:0,

            };

        }



        const start =

            this.history[0]

                .equity;



        const current =

            this.latest()!

                .equity;



        const values =

            this.history.map(

                item =>

                    item.equity

            );



        const highest =

            Math.max(

                ...values

            );



        const lowest =

            Math.min(

                ...values

            );



        const totalReturn =

            current -

            start;



        const totalReturnPercent =

            start === 0

                ? 0

                :

                (

                    totalReturn /

                    start

                )

                *

                100;



        return {


            startEquity:start,


            currentEquity:current,


            highestEquity:highest,


            lowestEquity:lowest,


            totalReturn:


                Number(

                    totalReturn.toFixed(2)

                ),



            totalReturnPercent:


                Number(

                    totalReturnPercent.toFixed(2)

                ),

        };

    }



    /**
     * Clear history.
     */
    clear():void {


        this.history = [];

    }



    /**
     * Total recorded points.
     */
    size():number {


        return this.history.length;

    }

}



const equityCurve =

    new EquityCurve();



export default equityCurve;
