/**
==========================================================
AURA Trade OS
Live Trading Risk Manager
Version : 0.1.0 Alpha
==========================================================
Main Risk Decision Engine
==========================================================
*/


import exposureManager

from "./exposure";


import positionLimit

from "./positionLimit";



import type {

    RiskRequest,

    RiskDecision

}

from "../types";








export class RiskManager {



    private enabled:boolean = true;



    private minimumConfidence:number;







    constructor(

        minimumConfidence:number = 70

    ){


        this.minimumConfidence =

            minimumConfidence;


    }









    /**
     * Main risk evaluation
     */
    evaluate(

        request:RiskRequest

    ):RiskDecision {



        if(

            !this.enabled

        ){


            return this.reject(

                "Risk system disabled"

            );


        }







        /*
        =====================================
        Confidence Check
        =====================================
        */


        if(

            request.confidence <

            this.minimumConfidence

        ){


            return this.reject(

                "Confidence below minimum"

            );


        }








        /*
        =====================================
        Balance Check
        =====================================
        */


        if(

            request.orderValue >

            request.balance

        ){


            return this.reject(

                "Insufficient balance"

            );


        }








        /*
        =====================================
        Position Limit Check
        =====================================
        */


        const positionCheck =

            positionLimit.check(

                request.symbol,

                request.orderValue,

                request.balance

            );







        if(

            !positionCheck.allowed

        ){



            return this.reject(

                positionCheck.reason

            );


        }








        /*
        =====================================
        Exposure Check
        =====================================
        */


        const exposureAllowed =

            exposureManager.canAddExposure(

                request.balance,

                request.orderValue

            );







        if(

            !exposureAllowed

        ){



            return this.reject(

                "Exposure limit exceeded"

            );


        }









        return {



            approved:true,


            reason:

                "Risk validation passed",



            riskScore:

                this.calculateRiskScore(

                    request

                ),



            timestamp:

                Date.now()



        };



    }









    /**
     * Risk scoring
     */
    private calculateRiskScore(

        request:RiskRequest

    ){



        let score = 100;








        if(

            request.confidence < 80

        ){


            score -= 15;


        }







        if(

            request.orderValue >

            request.balance * 0.1

        ){


            score -= 20;


        }







        return Math.max(

            score,

            0

        );



    }









    private reject(

        reason:string

    ):RiskDecision {



        return {



            approved:false,


            reason,


            riskScore:0,


            timestamp:

                Date.now()



        };


    }









    enable(){



        this.enabled = true;


    }









    disable(){



        this.enabled = false;


    }



}








const riskManager =

    new RiskManager();





export default riskManager;
