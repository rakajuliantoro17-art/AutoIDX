/**
==========================================================
AURA Trade OS
Indodax API Client
Version : 0.1.0 Alpha
==========================================================
Exchange Communication Layer
==========================================================
*/


import crypto from "crypto";



import type {

    ExchangeResponse

}

from "../types";









export class IndodaxClient {



    private apiKey:string;


    private secretKey:string;


    private baseURL:string;









    constructor(){



        this.apiKey =

            process.env.INDODAX_API_KEY

            ?? "";





        this.secretKey =

            process.env.INDODAX_SECRET_KEY

            ?? "";





        this.baseURL =

            process.env.INDODAX_API_URL

            ??

            "https://indodax.com/tapi";



    }









    /**
     * Public endpoint request
     */
    async publicRequest(

        endpoint:string

    ):Promise<ExchangeResponse>{



        try {



            const response =

                await fetch(

                    `https://indodax.com/api/${endpoint}`

                );







            const data =

                await response.json();








            return {


                success:true,


                message:"OK",


                data



            };





        }

        catch(error:any){



            return {


                success:false,


                message:

                    error.message,


                data:null



            };


        }


    }









    /**
     * Private endpoint request
     */
    async privateRequest(

        method:string,

        params:any={}

    ):Promise<ExchangeResponse>{



        try {



            const timestamp =

                Date.now();








            const payload = {



                method,


                timestamp,


                ...params



            };








            const body =

                new URLSearchParams(

                    payload

                )

                .toString();








            const signature =

                crypto

                .createHmac(

                    "sha512",

                    this.secretKey

                )

                .update(

                    body

                )

                .digest(

                    "hex"

                );









            const response =

                await fetch(

                    this.baseURL,

                    {


                        method:"POST",



                        headers:{


                            "Key":

                                this.apiKey,


                            "Sign":

                                signature,


                            "Content-Type":

                                "application/x-www-form-urlencoded"



                        },



                        body



                    }

                );








            const data =

                await response.json();








            if(

                data.success !== 1

            ){


                return {


                    success:false,


                    message:

                        data.error

                        ??

                        "API Error",



                    data:null



                };


            }







            return {


                success:true,


                message:"OK",


                data:



                    data.return



            };





        }

        catch(error:any){



            return {


                success:false,


                message:

                    error.message,


                data:null



            };


        }


    }









    /**
     * Check API connection
     */
    async ping(){



        const result =

            await this.publicRequest(

                "ticker"

            );





        return result.success;


    }





}







const indodaxClient =

    new IndodaxClient();





export default indodaxClient;
