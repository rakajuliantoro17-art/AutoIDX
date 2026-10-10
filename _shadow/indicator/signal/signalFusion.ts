/**
==========================================================
AURA Trade OS
Signal Fusion Engine
Version : 0.1.0 Alpha
==========================================================
*/


export type FusionSignal =

    | "STRONG_BUY"

    | "BUY"

    | "HOLD"

    | "SELL"

    | "STRONG_SELL";




export interface IndicatorSignal {


    name:string;


    signal:FusionSignal;


    weight:number;


    confidence:number;


}





export interface FusionResult {


    signal:FusionSignal;


    confidence:number;


    score:number;


    explanation:string[];


    timestamp:number;

}





export class SignalFusionEngine {



    /**
     * Combine indicator signals
     */
    fuse(

        signals:IndicatorSignal[]

    ):FusionResult {



        let score = 0;



        let totalWeight = 0;



        const explanation:string[] = [];




        for(

            const item of signals

        ){


            const value =

                this.signalValue(

                    item.signal

                );



            score +=

                value *

                item.weight *

                item.confidence;



            totalWeight +=

                item.weight;



            explanation.push(

                `${item.name}: ${item.signal}`

            );

        }





        const normalizedScore =

            totalWeight === 0

            ?

            0

            :

            score /

            totalWeight;





        const signal =

            this.resolveSignal(

                normalizedScore

            );





        return {


            signal,


            confidence:

                Math.min(

                    Math.abs(

                        normalizedScore

                    ),

                    1

                ),



            score:

                Number(

                    normalizedScore.toFixed(3)

                ),



            explanation,


            timestamp:

                Date.now()


        };

    }





    /**
     * Convert signal to numeric value
     */
    private signalValue(

        signal:FusionSignal

    ){



        switch(signal){


            case "STRONG_BUY":

                return 1;



            case "BUY":

                return 0.5;



            case "HOLD":

                return 0;



            case "SELL":

                return -0.5;



            case "STRONG_SELL":

                return -1;



        }

    }





    /**
     * Final decision
     */
    private resolveSignal(

        score:number

    ):FusionSignal {



        if(score >= 0.75)

            return "STRONG_BUY";



        if(score >= 0.25)

            return "BUY";



        if(score <= -0.75)

            return "STRONG_SELL";



        if(score <= -0.25)

            return "SELL";



        return "HOLD";

    }


}





const signalFusion =

    new SignalFusionEngine();



export default signalFusion;
