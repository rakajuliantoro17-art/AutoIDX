/**
==========================================================
AURA Trade OS
Indicator Signal Generator
Version : 0.1.0 Alpha
==========================================================
*/


export type TradingSignal =

    | "STRONG_BUY"

    | "BUY"

    | "HOLD"

    | "SELL"

    | "STRONG_SELL";




export interface IndicatorSnapshot {


    emaFast:number;


    emaSlow:number;


    rsi:number;


    macd:number;


    macdSignal:number;


    adx:number;


    stochasticK:number;


    stochasticD:number;


    bollingerUpper?:number;


    bollingerLower?:number;


    price?:number;


}




export interface GeneratedSignal {


    signal:TradingSignal;


    confidence:number;


    score:number;


    reasons:string[];


    timestamp:number;


}





export class SignalGenerator {



    generate(

        indicators:IndicatorSnapshot

    ):GeneratedSignal {



        let score = 0;



        const reasons:string[] = [];




        /**
         * EMA Trend
         */
        if(

            indicators.emaFast >

            indicators.emaSlow

        ){


            score += 0.25;


            reasons.push(

                "EMA bullish trend"

            );


        }

        else{


            score -= 0.25;


            reasons.push(

                "EMA bearish trend"

            );

        }





        /**
         * RSI Momentum
         */
        if(

            indicators.rsi < 30

        ){


            score += 0.3;


            reasons.push(

                "RSI oversold recovery opportunity"

            );


        }

        else if(

            indicators.rsi > 70

        ){


            score -= 0.3;


            reasons.push(

                "RSI overbought condition"

            );


        }

        else if(

            indicators.rsi >=40

            &&

            indicators.rsi <=60

        ){


            score +=0.05;


            reasons.push(

                "RSI neutral zone"

            );

        }





        /**
         * MACD Momentum
         */
        if(

            indicators.macd >

            indicators.macdSignal

        ){


            score +=0.25;


            reasons.push(

                "MACD positive momentum"

            );


        }

        else{


            score -=0.25;


            reasons.push(

                "MACD negative momentum"

            );

        }





        /**
         * ADX Trend Strength
         */
        if(

            indicators.adx >=25

        ){


            score +=0.1;


            reasons.push(

                "Strong trend detected"

            );


        }





        /**
         * Stochastic Confirmation
         */
        if(

            indicators.stochasticK < 20

            &&

            indicators.stochasticD < 20

        ){


            score +=0.15;


            reasons.push(

                "Stochastic oversold"

            );


        }


        else if(

            indicators.stochasticK > 80

            &&

            indicators.stochasticD >80

        ){


            score -=0.15;


            reasons.push(

                "Stochastic overbought"

            );

        }





        /**
         * Normalize
         */
        score =

            Math.max(

                -1,

                Math.min(

                    score,

                    1

                )

            );





        return {


            signal:

                this.resolveSignal(

                    score

                ),



            confidence:

                Number(

                    Math.abs(score)

                    .toFixed(2)

                ),



            score:

                Number(

                    score.toFixed(2)

                ),



            reasons,



            timestamp:

                Date.now()


        };

    }





    private resolveSignal(

        score:number

    ):TradingSignal {



        if(score >=0.75)

            return "STRONG_BUY";



        if(score >=0.25)

            return "BUY";



        if(score <=-0.75)

            return "STRONG_SELL";



        if(score <=-0.25)

            return "SELL";



        return "HOLD";

    }


}





const signalGenerator =

    new SignalGenerator();



export default signalGenerator;
