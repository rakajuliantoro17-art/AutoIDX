/**
==========================================================
AURA Trade OS
ML Dataset Sampler
Version : 0.1.0 Alpha
==========================================================
*/


import {

  TrainingSample,

  PredictionLabel

} from "../types";



export type SamplingStrategy =


  | "RANDOM"

  | "BALANCED"

  | "TIME_SERIES";





export interface SamplingOptions {


  strategy: SamplingStrategy;


  size?: number;


  shuffle?: boolean;


}





export interface SamplingResult {


  samples: TrainingSample[];


  originalSize:number;


  finalSize:number;


}





export class DatasetSampler {



  sample(

    dataset:TrainingSample[],

    options:SamplingOptions

  ):SamplingResult {



    let result:

      TrainingSample[];



    switch(options.strategy){


      case "BALANCED":


        result =

          this.balance(

            dataset

          );


        break;



      case "TIME_SERIES":


        result =

          this.timeSeries(

            dataset,

            options.size

          );


        break;



      case "RANDOM":


      default:


        result =

          this.random(

            dataset,

            options.size

          );



    }





    if(options.shuffle){


      result =

        this.shuffle(

          result

        );


    }





    return {


      samples:result,


      originalSize:

        dataset.length,


      finalSize:

        result.length,


    };


  }





  /**
   * Random Sampling
   */


  private random(

    dataset:TrainingSample[],

    size?:number

  ){



    const copy =

      [...dataset];



    this.shuffle(copy);



    return size

      ? copy.slice(

          0,

          size

        )

      : copy;



  }





  /**
   * Balance BUY HOLD SELL
   */


  private balance(

    dataset:TrainingSample[]

  ){



    const groups:

    Record<PredictionLabel, TrainingSample[]> = {


      BUY:[],


      SELL:[],


      HOLD:[],


      STRONG_BUY:[],


      STRONG_SELL:[]


    };





    for(

      const item of dataset

    ){

      groups[item.label]

      .push(item);

    }





    const min =

      Math.min(

        ...Object.values(groups)

        .filter(

          g => g.length>0

        )

        .map(

          g=>g.length

        )

      );





    const result:

      TrainingSample[] = [];





    Object.values(groups)

    .forEach(group=>{


      result.push(

        ...

        group.slice(

          0,

          min

        )

      );


    });





    return result;



  }





  /**
   * Time Series Sampling
   *
   * Tidak merusak urutan candle
   */


  private timeSeries(

    dataset:TrainingSample[],

    size?:number

  ){



    const sorted =

      [...dataset]

      .sort(

        (a,b)=>

          a.features.timestamp -

          b.features.timestamp

      );



    if(!size){

      return sorted;

    }



    return sorted.slice(

      sorted.length-size

    );


  }





  /**
   * Shuffle
   */


  private shuffle(

    array:TrainingSample[]

  ){



    for(

      let i=array.length-1;

      i>0;

      i--

    ){


      const j =

        Math.floor(

          Math.random()

          *

          (i+1)

        );



      [

        array[i],

        array[j]

      ] = [


        array[j],

        array[i]

      ];



    }



    return array;


  }



}





const datasetSampler =

new DatasetSampler();



export default datasetSampler;
