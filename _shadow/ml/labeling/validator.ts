/**
==========================================================
AURA Trade OS
ML Label Validator
Version : 0.1.0 Alpha
==========================================================
*/


import {

 PredictionLabel

} from "../types";



export interface LabelSample {


 label:PredictionLabel;


 futureReturn:number;


 timestamp:number;


}



export interface LabelValidationReport {


 valid:boolean;


 total:number;


 invalid:number;


 warnings:string[];


 distribution:

 Record<string,number>;


}





export class LabelValidator {



 private allowedLabels:

 PredictionLabel[] = [


  "STRONG_BUY",

  "BUY",

  "HOLD",

  "SELL",

  "STRONG_SELL"


 ];





 validate(

  samples:LabelSample[]

 ):LabelValidationReport {



  let invalid = 0;


  const warnings:string[]=[];


  const distribution:

  Record<string,number>={};





  for(

   const sample of samples

  ){



   /**
    * Count Distribution
    */

   distribution[

    sample.label

   ] =

    (

     distribution[

      sample.label

     ]

     ||

     0

    )

    +1;





   /**
    * Validate Label
    */

   if(

    !this.allowedLabels

    .includes(

     sample.label

    )

   ){

    invalid++;

    warnings.push(

     `Unknown label ${sample.label}`

    );

   }





   /**
    * Return Consistency
    */

   if(

    sample.label==="BUY"

    &&

    sample.futureReturn < 0

   ){

    invalid++;

    warnings.push(

     "BUY label has negative return"

    );

   }





   if(

    sample.label==="SELL"

    &&

    sample.futureReturn > 0

   ){

    invalid++;

    warnings.push(

     "SELL label has positive return"

    );

   }


  }





  this.checkBalance(

   distribution,

   warnings

  );





  return {


   valid:

    invalid===0,


   total:

    samples.length,


   invalid,


   warnings,


   distribution


  };


 }







 private checkBalance(

  distribution:

  Record<string,number>,


  warnings:string[]

 ){



  const total =

   Object.values(

    distribution

   )

   .reduce(

    (a,b)=>a+b,

    0

   );





  Object.entries(

   distribution

  )

  .forEach(

   ([label,count])=>{



    const ratio =

     count /

     total;





    if(

     ratio > 0.8

    ){

     warnings.push(

      `${label} dominates dataset`

     );

    }



   }

  );



 }



}





const labelValidator =

new LabelValidator();



export default labelValidator;
