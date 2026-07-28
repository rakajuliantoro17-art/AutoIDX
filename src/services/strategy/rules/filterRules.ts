/**
==========================================================
AURA Trade OS
Strategy Market Filter Rules
Version : 0.1.0 Alpha
==========================================================
Market Eligibility Conditions
==========================================================
*/


import evaluator, {

    EvaluationRule

}

from "../core/evaluator";





export const filterRules:EvaluationRule[] = [



    /**
     * Trend Availability Filter
     */
    evaluator.condition(

        "Minimum Trend Strength",

        "ADX must indicate tradable trend",

        0.25,


        (features)=>{


            return (

                features.adx >= 20

            );


        }


    ),







    /**
     * Volatility Protection
     */
    evaluator.condition(

        "Safe Volatility",

        "ATR must not exceed extreme volatility",

        0.25,


        (features)=>{


            if(

                features.price <=0

            ){

                return false;

            }



            const atrPercent =

                (

                    features.atr /

                    features.price

                )

                *

                100;




            return (

                atrPercent <= 5

            );


        }


    ),







    /**
     * Volume Validation
     */
    evaluator.condition(

        "Market Volume Available",

        "Market has valid trading volume",

        0.20,


        (features)=>{


            return (

                features.volume > 0

            );


        }


    ),







    /**
     * RSI Safety Zone
     */
    evaluator.condition(

        "Avoid RSI Extreme",

        "Avoid panic and euphoria zone",

        0.15,


        (features)=>{


            return (

                features.rsi >20

                &&

                features.rsi <80

            );


        }


    ),







    /**
     * Price Validation
     */
    evaluator.condition(

        "Valid Market Price",

        "Price must be greater than zero",

        0.15,


        (features)=>{


            return (

                features.price >0

            );


        }


    )



];






export default filterRules;
