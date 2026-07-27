/**
==========================================================
AURA Trade OS
ML Dataset Exporter
Version : 0.1.0 Alpha
==========================================================
*/


import {

  TrainingSample

} from "../types";



export type DatasetFormat =

  | "JSON"

  | "CSV";



export interface ExportMetadata {


  name:string;


  version:string;


  samples:number;


  createdAt:number;


  format:DatasetFormat;


}



export interface ExportResult {


  success:boolean;


  filename:string;


  content:string;


  metadata:ExportMetadata;


}



export class DatasetExporter {



  /**
   * Export Dataset
   */


  export(

    dataset:TrainingSample[],

    format:DatasetFormat,

    name="aura_dataset"

  ):ExportResult {



    const metadata:ExportMetadata = {


      name,


      version:"1.0.0",


      samples:

        dataset.length,


      createdAt:

        Date.now(),


      format,


    };



    let content="";



    switch(format){



      case "JSON":


        content =

          this.toJSON(

            dataset

          );


        break;



      case "CSV":


        content =

          this.toCSV(

            dataset

          );


        break;



    }



    return {


      success:true,


      filename:

        `${name}.${format.toLowerCase()}`,



      content,



      metadata,


    };


  }





  /**
   * JSON Export
   */


  private toJSON(

    dataset:TrainingSample[]

  ):string {



    return JSON.stringify(

      {

        metadata:{

          source:

            "AURA Trade OS",

          createdAt:

            Date.now()

        },


        data:

          dataset


      },

      null,

      2

    );


  }





  /**
   * CSV Export
   */


  private toCSV(

    dataset:TrainingSample[]

  ):string {



    if(

      dataset.length===0

    ){

      return "";

    }



    const headers=[


      "timestamp",


      "symbol",


      "timeframe",


      "label"



    ];



    const rows =


      dataset.map(

        item=>[


          item.features.timestamp,


          item.features.symbol,


          item.features.timeframe,


          item.label



        ]

      );



    return [


      headers.join(","),


      ...rows.map(

        row=>

          row.join(",")

      )



    ]

    .join("\n");



  }


}



const datasetExporter =

new DatasetExporter();



export default datasetExporter;
