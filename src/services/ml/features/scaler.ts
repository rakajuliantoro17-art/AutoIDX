/**
==========================================================
AURA Trade OS
ML Feature Scaler
Version : 0.1.0 Alpha
==========================================================
*/


export type ScalingMethod =

  | "MIN_MAX"

  | "STANDARD"

  | "ROBUST";



export interface ScalingResult {

  values:number[];

  method:ScalingMethod;

}



export class FeatureScaler {



  /**
   * Scale Feature Vector
   */


  scale(

    values:number[],

    method:ScalingMethod = "MIN_MAX"

  ):ScalingResult {



    switch(method){


      case "STANDARD":

        return {

          values:

            this.standard(

              values

            ),

          method

        };



      case "ROBUST":

        return {

          values:

            this.robust(

              values

            ),

          method

        };



      default:

        return {

          values:

            this.minMax(

              values

            ),

          method

        };


    }


  }





  /**
   * Min Max Scaling
   *
   * output 0 - 1
   */


  private minMax(

    values:number[]

  ):number[]{



    const min =

      Math.min(

        ...values

      );



    const max =

      Math.max(

        ...values

      );



    if(max===min){

      return values.map(

        ()=>0

      );

    }



    return values.map(

      value =>


      (

        value-min

      )

      /

      (

        max-min

      )

    );


  }





  /**
   * Standard Scaling
   *
   * Z-score
   */


  private standard(

    values:number[]

  ):number[]{



    const mean =

      values.reduce(

        (a,b)=>a+b,

        0

      )

      /

      values.length;



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

      values.length;





    const std =

      Math.sqrt(

        variance

      );





    if(std===0){

      return values.map(

        ()=>0

      );

    }





    return values.map(

      value =>

        (

          value-mean

        )

        /

        std

    );


  }





  /**
   * Robust Scaling
   *
   * median + IQR
   */


  private robust(

    values:number[]

  ):number[]{



    const sorted =

      [...values]

      .sort(

        (a,b)=>a-b

      );



    const median =

      this.percentile(

        sorted,

        50

      );



    const q1 =

      this.percentile(

        sorted,

        25

      );



    const q3 =

      this.percentile(

        sorted,

        75

      );



    const iqr =

      q3-q1;





    if(iqr===0){

      return values.map(

        ()=>0

      );

    }





    return values.map(

      value =>


      (

        value-median

      )

      /

      iqr


    );


  }





  /**
   * Percentile Helper
   */


  private percentile(

    values:number[],

    percentile:number

  ){



    const index =

      (

        percentile/

        100

      )

      *

      (

        values.length-1

      );



    const lower =

      Math.floor(

        index

      );



    const upper =

      Math.ceil(

        index

      );



    if(lower===upper){

      return values[lower];

    }



    return (

      values[lower]

      +

      values[upper]

    )

    /

    2;


  }


}





const featureScaler =

new FeatureScaler();



export default featureScaler;
