/**
==========================================================
AURA Trade OS
ML Feature Vectorizer
Version : 0.1.0 Alpha
==========================================================
*/


export interface VectorSchema {


  name:string;


  order:string[];


}



export interface VectorResult {


  vector:number[];


  schema:string[];


}





export class FeatureVectorizer {



  private schema:string[] = [];



  /**
   * Build Vector
   */


  build(

    features:Record<string,number>,

    schema?:string[]

  ):VectorResult {



    const order =

      schema ??

      Object.keys(features);





    const vector:number[] = [];





    for(

      const key of order

    ){


      vector.push(

        features[key]

        ??

        0

      );


    }





    this.schema = order;





    return {


      vector,


      schema:order


    };


  }





  /**
   * Restore Object
   */


  decode(

    vector:number[],

    schema:string[]

  ):Record<string,number>{



    const result:

      Record<string,number> = {};





    schema.forEach(

      (key,index)=>{


        result[key] =

          vector[index]

          ??

          0;


      }

    );





    return result;


  }





  /**
   * Get Current Schema
   */


  getSchema(){

    return this.schema;

  }





  /**
   * Merge Multiple Features
   */


  merge(

    ...sources:

    Record<string,number>[]

  ):



  Record<string,number>{



    return Object.assign(

      {},

      ...sources

    );


  }





}





const featureVectorizer =

new FeatureVectorizer();



export default featureVectorizer;
