/**
==========================================================
AURA Trade OS
ML Dataset Validator
Version : 0.1.0 Alpha
==========================================================
*/


import {

  TrainingSample

} from "../types";



export interface ValidationReport {


  valid:boolean;


  total:number;


  passed:number;


  failed:number;


  errors:string[];


}



export class DatasetValidator {



  private allowedLabels = [


    "STRONG_BUY",

    "BUY",

    "HOLD",

    "SELL",

    "STRONG_SELL"


  ];





  /**
   * Validate Dataset
   */


  validate(

    dataset:TrainingSample[]

  ):ValidationReport {



    const errors:string[]=[];


    let passed=0;


    let failed=0;





    for(

      const sample of dataset

    ){



      const result =

        this.validateSample(

          sample

        );





      if(result.valid){


        passed++;


      }

      else {


        failed++;


        errors.push(

          result.error!

        );


      }


    }





    return {


      valid:

        failed===0,


      total:

        dataset.length,


      passed,


      failed,


      errors,


    };


  }





  /**
   * Single Sample Validation
   */


  private validateSample(

    sample:any

  ){



    if(

      !sample.features

    ){

      return {


        valid:false,


        error:

        "Missing feature object"


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





    if(

      !this.allowedLabels

      .includes(

        sample.label

      )

    ){

      return {


        valid:false,


        error:

        `Invalid label ${sample.label}`


      };


    }





    const feature =

      sample.features;





    if(

      !feature.symbol

    ){

      return {


        valid:false,


        error:

        "Missing symbol"


      };


    }





    if(

      !feature.timestamp

    ){

      return {


        valid:false,


        error:

        "Invalid timestamp"


      };


    }





    if(

      !feature.values

    ){

      return {


        valid:false,


        error:

        "Missing values"


      };


    }





    return {


      valid:true


    };



  }





  /**
   * Detect Future Leakage
   */


  detectLeakage(

    features:string[]

  ){



    const forbidden=[


      "futurePrice",

      "nextClose",

      "tomorrow",

      "futureReturn"


    ];





    return features.filter(

      feature =>

        forbidden.some(

          word =>

          feature

          .toLowerCase()

          .includes(

            word

          )

        )

    );


  }



}





const datasetValidator =

new DatasetValidator();



export default datasetValidator;
