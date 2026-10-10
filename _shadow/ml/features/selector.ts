/**
==========================================================
AURA Trade OS
ML Feature Selector
Version : 0.1.0 Alpha
==========================================================
*/


export type SelectionMethod =

  | "MANUAL"

  | "VARIANCE"

  | "CORRELATION"

  | "IMPORTANCE";



export interface FeatureScore {

  name:string;

  score:number;

}



export interface SelectionResult {


  selected:string[];


  removed:string[];


}



export class FeatureSelector {



  /**
   * Select Features
   */


  select(

    features:Record<string,number>,

    method:SelectionMethod,

    options?:{

      threshold?:number;

      whitelist?:string[];

    }

  ):SelectionResult {



    switch(method){


      case "MANUAL":

        return this.manual(

          features,

          options?.whitelist ?? []

        );



      case "VARIANCE":

        return this.variance(

          features,

          options?.threshold ?? 0.01

        );



      default:

        return {


          selected:

            Object.keys(features),


          removed:[]


        };


    }


  }





  /**
   * Manual Selection
   */


  private manual(

    features:Record<string,number>,

    whitelist:string[]

  ):SelectionResult {



    const selected =

      Object.keys(features)

      .filter(

        key =>

        whitelist.includes(key)

      );



    const removed =

      Object.keys(features)

      .filter(

        key =>

        !selected.includes(key)

      );



    return {


      selected,


      removed


    };


  }





  /**
   * Variance Selection
   *
   * Menghapus fitur
   * yang terlalu konstan
   */


  private variance(

    features:Record<string,number>,

    threshold:number

  ):SelectionResult {



    const selected:string[]=[];

    const removed:string[]=[];



    Object.entries(features)

    .forEach(

      ([key,value])=>{


        if(

          Math.abs(value)

          >

          threshold

        ){

          selected.push(

            key

          );

        }

        else {


          removed.push(

            key

          );


        }


      }

    );



    return {


      selected,


      removed


    };


  }



}





const featureSelector =

new FeatureSelector();



export default featureSelector;
