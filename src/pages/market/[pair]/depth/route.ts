/**
==========================================================
AURA Trade OS
Market Depth API
Version : 0.0.1 Alpha
==========================================================
*/


import {
NextResponse
} from "next/server";



export async function GET(

request:Request,

context:{
params:{
pair:string
}
}

){


const pair=context.params.pair;



try{


const res=

await fetch(

`https://indodax.com/api/${pair}/depth`

);



const data=

await res.json();





return NextResponse.json({


bids:

(data.buy ?? [])

.slice(0,10)

.map((x:string[])=>({


price:Number(x[0]),


amount:Number(x[1])


})),



asks:

(data.sell ?? [])

.slice(0,10)

.map((x:string[])=>({


price:Number(x[0]),


amount:Number(x[1])


}))



});



}

catch(error){


return NextResponse.json(

{

error:"Depth unavailable"

},

{

status:500

}

);


}


}
