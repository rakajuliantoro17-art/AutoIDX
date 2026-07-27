/**
==========================================================
AURA Trade OS
ML Dataset Builder
Version : 0.1.0 Alpha
==========================================================
*/


import {

  FeatureRecord,

  TrainingSample,

  PredictionLabel,

} from "../types";



export interface DatasetBuilderOptions {


  futureWindow?: number;


  profitThreshold?: number;


  lossThreshold?: number;


}



export interface DatasetResult {


  samples: TrainingSample[];


  total: number;


  createdAt: number;


}



export class DatasetBuilder {



  private options:
    DatasetBuilderOptions;



  constructor(

    options:
      DatasetBuilderOptions = {}

  ){

    this.options = {

      futureWindow:
        options.futureWindow ?? 10,


      profitThreshold:
        options.profitThreshold ?? 2,


      lossThreshold:
        options.lossThreshold ?? -2,


    };


  }





  /**
   * Build Dataset
   */


  build(

    features: FeatureRecord[]

  ): DatasetResult {



    const sorted =

      [...features]

      .sort(

        (a,b)=>

          a.timestamp -

          b.timestamp

      );



    const samples:

      TrainingSample[] = [];



    for(

      let i = 0;

      i < sorted.length;

      i++

    ){



      const current =

        sorted[i];



      const future =

        sorted[

          i +

          this.options.futureWindow!

        ];



      if(!future){

        continue;

      }



      const label =

        this.generateLabel(

          current,

          future

        );



      samples.push({


        features:

          current,


        label,


      });



    }



    return {


      samples,


      total:

        samples.length,


      createdAt:

        Date.now(),


    };


  }





  /**
   * Generate Label
   */


  private generateLabel(

    current:

      FeatureRecord,


    future:

      FeatureRecord


  ): PredictionLabel {



    const currentPrice =

      current.values.price;



    const futurePrice =

      future.values.price;



    const change =


      (

        (

          futurePrice -

          currentPrice

        )

        /

        currentPrice

      )

      *

      100;





    if(

      change >=

      this.options.profitThreshold!

    ){

      return "BUY";

    }





    if(

      change <=

      this.options.lossThreshold!

    ){

      return "SELL";

    }





    return "HOLD";


  }



}



const datasetBuilder =

new DatasetBuilder();



export default datasetBuilder;
