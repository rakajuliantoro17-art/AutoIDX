/**
==========================================================
AURA Trade OS
Indicator Registry
Version : 0.1.0 Alpha
==========================================================
*/


import ema from "./trend/ema";

import macd from "./trend/macd";

import adx from "./trend/adx";


import rsi from "./momentum/rsi";

import stochastic from "./momentum/stochastic";


import atr from "./volatility/atr";

import bollinger from "./volatility/bollinger";





export type IndicatorName =


    | "EMA"

    | "MACD"

    | "ADX"

    | "RSI"

    | "STOCHASTIC"

    | "ATR"

    | "BOLLINGER";





export interface RegisteredIndicator {


    name:IndicatorName;


    instance:any;


    description:string;


    category:

        | "TREND"

        | "MOMENTUM"

        | "VOLATILITY";


}






export class IndicatorRegistry {



    private indicators:

        Map<IndicatorName, RegisteredIndicator>;





    constructor(){


        this.indicators =

            new Map();



        this.registerDefaultIndicators();


    }






    /**
     * Register default AURA indicators
     */
    private registerDefaultIndicators(){



        this.register({

            name:"EMA",

            instance:ema,

            description:

                "Exponential Moving Average trend detector",

            category:"TREND"

        });




        this.register({

            name:"MACD",

            instance:macd,

            description:

                "Momentum convergence divergence indicator",

            category:"TREND"

        });




        this.register({

            name:"ADX",

            instance:adx,

            description:

                "Trend strength measurement",

            category:"TREND"

        });




        this.register({

            name:"RSI",

            instance:rsi,

            description:

                "Relative Strength Index momentum",

            category:"MOMENTUM"

        });




        this.register({

            name:"STOCHASTIC",

            instance:stochastic,

            description:

                "Stochastic oscillator reversal detector",

            category:"MOMENTUM"

        });




        this.register({

            name:"ATR",

            instance:atr,

            description:

                "Average True Range volatility indicator",

            category:"VOLATILITY"

        });




        this.register({

            name:"BOLLINGER",

            instance:bollinger,

            description:

                "Bollinger Bands volatility indicator",

            category:"VOLATILITY"

        });


    }






    /**
     * Add indicator
     */
    register(

        indicator:RegisteredIndicator

    ){


        this.indicators.set(

            indicator.name,

            indicator

        );


    }







    /**
     * Get indicator
     */
    get(

        name:IndicatorName

    ){


        return this.indicators.get(

            name

        );

    }







    /**
     * Check availability
     */
    has(

        name:IndicatorName

    ){


        return this.indicators.has(

            name

        );

    }







    /**
     * List all indicators
     */
    list(){



        return Array.from(

            this.indicators.values()

        );


    }





    /**
     * Remove indicator
     */
    remove(

        name:IndicatorName

    ){


        return this.indicators.delete(

            name

        );


    }


}





const indicatorRegistry =

    new IndicatorRegistry();




export default indicatorRegistry;
