/**
==========================================================
AURA Trade OS
ML Feature Encoder
Version : 0.1.0 Alpha
==========================================================
*/


export type EncodingMethod =

  | "LABEL"

  | "ONE_HOT"

  | "BOOLEAN";



export interface EncodedFeature {

  name:string;

  values:number[];

}



export class FeatureEncoder {



  /**
   * Encode Single Value
   */


  encode(

    value:string | boolean,

    method:EncodingMethod

  ):number[] {



    switch(method){


      case "BOOLEAN":

        return [

          value === true

          ? 1

          : 0

        ];



      case "LABEL":

        return [

          this.labelEncode(

            String(value)

          )

        ];



      default:

        return [

          0

        ];

    }


  }





  /**
   * Label Encoder
   */


  private labelEncode(

    value:string

  ):number {



    const map:

      Record<string,number> = {


        BUY:1,

        STRONG_BUY:2,


        HOLD:0,


        SELL:-1,

        STRONG_SELL:-2,


        BULLISH:1,

        BEARISH:-1,


        HIGH:1,

        MEDIUM:0.5,

        LOW:0,


        TRUE:1,

        FALSE:0


      };





    return (

      map[value.toUpperCase()]

      ??

      0

    );


  }





  /**
   * One Hot Encoder
   */


  oneHot(

    value:string,

    categories:string[]

  ):number[]{



    return categories.map(

      category =>

        category === value

        ? 1

        : 0

    );


  }





  /**
   * Encode Object
   */


  encodeObject(

    data:Record<string,any>

  ):Record<string,number[]>{



    const result:

      Record<string,number[]>

      = {};





    Object.entries(data)

    .forEach(

      ([key,value])=>{


        result[key] =

          this.encode(

            value,

            "LABEL"

          );


      }

    );





    return result;


  }



}



const featureEncoder =

new FeatureEncoder();



export default featureEncoder;
