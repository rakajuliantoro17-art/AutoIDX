/**
==========================================================
AURA Trade OS
ML Feature Normalizer
Version : 0.1.0 Alpha
==========================================================
*/


export type NormalizationMethod =

  | "L2"

  | "Z_SCORE"

  | "UNIT";



export interface NormalizationResult {

  values:number[];

  method:NormalizationMethod;

}



export class FeatureNormalizer {



  /**
   * Normalize Vector
   */

  normalize(

    values:number[],

    method:NormalizationMethod="L2"

  ):NormalizationResult {



    switch(method){


      case "Z_SCORE":

        return {

          values:

            this.zScore(values),

          method

        };



      case "UNIT":

        return {

          values:

            this.unit(values),

          method

        };



      default:

        return {

          values:

            this.l2(values),

          method

        };


    }

  }





  /**
   * L2 Normalization
   *
   * vector length = 1
   */

  private l2(

    values:number[]

  ):number[] {



    const magnitude =

      Math.sqrt(

        values.reduce(

          (sum,value)=>

            sum +

            value * value,

          0

        )

      );



    if(magnitude===0){

      return values.map(

        ()=>0

      );

    }



    return values.map(

      value =>

        value / magnitude

    );


  }





  /**
   * Z Score
   */

  private zScore(

    values:number[]

  ):number[] {



    const mean =

      values.reduce(

        (a,b)=>a+b,

        0

      )

      /

      values.length;



    const variance =

      values.reduce(

        (sum,value)=>

          sum +

          Math.pow(

            value-mean,

            2

          ),

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
   * Unit Normalization
   *
   * Sum = 1
   */

  private unit(

    values:number[]

  ):number[]{



    const sum =

      values.reduce(

        (a,b)=>a+b,

        0

      );



    if(sum===0){

      return values.map(

        ()=>0

      );

    }



    return values.map(

      value =>

        value / sum

    );


  }



}





const featureNormalizer =

new FeatureNormalizer();



export default featureNormalizer;
