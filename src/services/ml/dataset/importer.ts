/**
==========================================================
AURA Trade OS
ML Dataset Importer
Version : 0.1.0 Alpha
==========================================================
*/


import {

  TrainingSample,

  FeatureRecord,

  PredictionLabel

} from "../types";



export type ImportFormat =

  | "JSON"

  | "CSV";




export interface ImportResult {


  success:boolean;


  samples:TrainingSample[];


  total:number;


  errors:string[];


}





export class DatasetImporter {



  /**
   * Import Dataset
   */


  import(

    content:string,

    format:ImportFormat

  ):ImportResult {



    try {



      switch(format){



        case "JSON":


          return this.fromJSON(

            content

          );



        case "CSV":


          return this.fromCSV(

            content

          );



      }



    }

    catch(error){


      return {


        success:false,


        samples:[],


        total:0,


        errors:[

          String(error)

        ]

      };


    }



  }





  /**
   * JSON Parser
   */


  private fromJSON(

    content:string

  ):ImportResult {



    const parsed =

      JSON.parse(

        content

      );



    const data =

      parsed.data ??

      parsed;



    const samples:

      TrainingSample[] = [];



    const errors:string[] = [];





    for(

      const item of data

    ){



      const result =

        this.validate(

          item

        );



      if(result.valid){



        samples.push(

          item

        );



      }

      else {



        errors.push(

          result.error!

        );


      }


    }





    return {


      success:

        errors.length === 0,


      samples,


      total:

        samples.length,


      errors,


    };


  }





  /**
   * CSV Parser
   */


  private fromCSV(

    content:string

  ):ImportResult {



    const lines =

      content.trim()

      .split("\n");



    if(

      lines.length < 2

    ){

      return {


        success:false,


        samples:[],


        total:0,


        errors:[

          "Empty CSV"

        ]

      };

    }





    const headers =

      lines[0]

      .split(",");





    const samples:

      TrainingSample[] = [];



    const errors:string[] = [];





    for(

      let i=1;

      i<lines.length;

      i++

    ){



      const values =

        lines[i]

        .split(",");



      const row:any = {};



      headers.forEach(

        (key,index)=>{


          row[key.trim()]=

            values[index];


        }

      );



      const sample =

        this.csvToSample(

          row

        );



      const result =

        this.validate(

          sample

        );



      if(result.valid){


        samples.push(

          sample

        );


      }

      else {


        errors.push(

          result.error!

        );


      }


    }





    return {


      success:

        errors.length===0,


      samples,


      total:

        samples.length,


      errors,


    };


  }





  /**
   * CSV Mapping
   */


  private csvToSample(

    row:any

  ):TrainingSample {



    const features:

      FeatureRecord = {



        timestamp:

          Number(

            row.timestamp

          ),



        symbol:

          row.symbol,



        timeframe:

          row.timeframe,



        values:{


          price:

            Number(

              row.price

            ),



        }



      };



    return {



      features,



      label:

        row.label as PredictionLabel



    };



  }





  /**
   * Validation
   */


  private validate(

    sample:any

  ):{


    valid:boolean;


    error?:string;


  } {



    if(

      !sample.features

    ){

      return {

        valid:false,

        error:

          "Missing features"

      };

    }





    if(

      !sample.label

    ){

      return {

        valid:false,

        error:

          "Missing label"

      };

    }





    return {


      valid:true


    };


  }


}





const datasetImporter =

new DatasetImporter();



export default datasetImporter;
