/**
==========================================================
AURA Trade OS
ML Feature Statistics Engine
Version : 0.1.0 Alpha
==========================================================
*/


export interface FeatureStatistics {


  count:number;


  min:number;


  max:number;


  mean:number;


  median:number;


  variance:number;


  standardDeviation:number;


  volatility:number;


}



export interface FeatureReport {


  name:string;


  statistics:FeatureStatistics;


  quality:
  
  | "GOOD"

  | "WARNING"

  | "BAD";


}





export class FeatureStatisticsEngine {



  /**
   * Analyze Feature
   */


  analyze(

    name:string,

    values:number[]

  ):FeatureReport {



    const stats =

      this.calculate(

        values

      );



    return {


      name,


      statistics:stats,


      quality:

        this.evaluate(

          stats

        )


    };


  }





  /**
   * Calculate Statistics
   */


  private calculate(

    values:number[]

  ):FeatureStatistics {



    const sorted =

      [...values]

      .sort(

        (a,b)=>a-b

      );



    const count =

      values.length;



    const mean =

      values.reduce(

        (a,b)=>a+b,

        0

      )

      /

      count;



    const variance =

      values.reduce(

        (sum,value)=>{


          return sum +

          Math.pow(

            value-mean,

            2

          );


        },

        0

      )

      /

      count;





    const std =

      Math.sqrt(

        variance

      );





    return {


      count,


      min:

        sorted[0],


      max:

        sorted[count-1],


      mean,


      median:

        this.median(

          sorted

        ),


      variance,


      standardDeviation:

        std,


      volatility:

        std /

        Math.abs(mean || 1)


    };


  }





  /**
   * Median
   */


  private median(

    values:number[]

  ){


    const mid =

      Math.floor(

        values.length/2

      );



    if(

      values.length % 2 === 0

    ){

      return (

        values[mid-1]

        +

        values[mid]

      )

      /

      2;

    }



    return values[mid];


  }





  /**
   * Feature Quality
   */


  private evaluate(

    stats:FeatureStatistics

  ):



  FeatureReport["quality"] {



    if(

      stats.standardDeviation===0

    ){

      return "BAD";

    }



    if(

      stats.volatility > 1

    ){

      return "WARNING";

    }



    return "GOOD";


  }



}





const featureStatistics =

new FeatureStatisticsEngine();



export default featureStatistics;
