/**
==========================================================
AURA Trade OS
Market Depth API
Version : 0.0.1 Alpha
==========================================================
*/


import type {
  NextApiRequest,
  NextApiResponse
} from "next";




interface DepthResponse {

  bids: {
    price:number;
    amount:number;
  }[];

  asks: {
    price:number;
    amount:number;
  }[];

}





export default async function handler(

  req:NextApiRequest,

  res:NextApiResponse<DepthResponse | {
    error:string
  }>

){



  if(req.method !== "GET") {


    return res.status(405).json({

      error:"Method not allowed"

    });


  }




  const {
    pair
  } = req.query;




  const activePair =
    typeof pair === "string"
      ? pair
      : "btc_idr";




  try {



    const response = await fetch(

      `https://indodax.com/api/${activePair}/depth`

    );




    if(!response.ok){

      throw new Error(
        "Indodax API failed"
      );

    }




    const data = await response.json();





    return res.status(200).json({



      bids:

        (data.buy ?? [])

        .slice(0,10)

        .map(
          (x:string[])=>({

            price:Number(x[0]),

            amount:Number(x[1])

          })

        ),





      asks:

        (data.sell ?? [])

        .slice(0,10)

        .map(
          (x:string[])=>({

            price:Number(x[0]),

            amount:Number(x[1])

          })

        )



    });





  } catch(error){



    console.error(
      "[DEPTH API ERROR]",
      error
    );



    return res.status(500).json({

      error:"Depth unavailable"

    });



  }


}
