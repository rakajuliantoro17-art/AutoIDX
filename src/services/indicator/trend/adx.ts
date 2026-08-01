/**
==========================================================
AURA Trade OS
Average Directional Index (ADX)
Version : 0.1.0 Alpha
==========================================================
*/


export interface ADXInput {


    high:number[];


    low:number[];


    close:number[];


}



export interface ADXConfig {


    period:number;

}



export interface ADXResult {


    adx:number;


    plusDI:number;


    minusDI:number;


    trend:

        | "STRONG"

        | "WEAK"

        | "SIDEWAYS";


    timestamp:number;

}




export class ADXIndicator {



    private config:ADXConfig;



    constructor(

        config?:Partial<ADXConfig>

    ){


        this.config={


            period:14,


            ...config

        };


    }





    calculate(

        input:ADXInput

    ):ADXResult|null {



        const {

            high,

            low,

            close

        } = input;



        const period =

            this.config.period;




        if(

            high.length <= period

            ||

            low.length <= period

            ||

            close.length <= period

        ){

            return null;

        }





        let trSum = 0;


        let plusDMSum = 0;


        let minusDMSum = 0;





        for(

            let i = 1;

            i < high.length;

            i++

        ){



            const currentTR =

                Math.max(

                    high[i] - low[i],

                    Math.abs(

                        high[i] -

                        close[i-1]

                    ),

                    Math.abs(

                        low[i] -

                        close[i-1]

                    )

                );



            trSum += currentTR;





            const upMove =

                high[i] -

                high[i-1];



            const downMove =

                low[i-1] -

                low[i];





            if(

                upMove > downMove

                &&

                upMove > 0

            ){


                plusDMSum += upMove;


            }



            if(

                downMove > upMove

                &&

                downMove > 0

            ){


                minusDMSum += downMove;


            }

        }





        if(trSum === 0){

            return null;

        }





        const plusDI =

            (

                plusDMSum /

                trSum

            )

            *

            100;





        const minusDI =

            (

                minusDMSum /

                trSum

            )

            *

            100;





        const dx =

            Math.abs(

                plusDI -

                minusDI

            )

            /

            (

                plusDI +

                minusDI ||

                1

            )

            *

            100;





        const adx =

            dx;





        return {


            adx:

                Number(

                    adx.toFixed(2)

                ),



            plusDI:

                Number(

                    plusDI.toFixed(2)

                ),



            minusDI:

                Number(

                    minusDI.toFixed(2)

                ),



            trend:

                this.classifyTrend(

                    adx

                ),



            timestamp:

                Date.now()

        };


    }





    private classifyTrend(

        adx:number

    ):



    "STRONG"

    |

    "WEAK"

    |

    "SIDEWAYS" {



        if(adx >=25)

            return "STRONG";



        if(adx >=20)

            return "WEAK";



        return "SIDEWAYS";


    }


}





const adx = new ADXIndicator();
export default adx;
