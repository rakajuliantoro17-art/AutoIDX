/**
==========================================================
AURA Trade OS
Market Pair Detail
Version : 0.0.1 Alpha
==========================================================
*/


"use client";


import {
useRouter
} from "next/router";


import {
useEffect,
useState
} from "react";


import DashboardLayout from "@/layouts/DashboardLayout";





interface DepthOrder {

price:number;

amount:number;

}





export default function MarketPairDetail(){



const router=useRouter();


const {pair}=router.query;



const activePair=

(pair as string)

||

"btc_idr";





const [bids,setBids]=

useState<DepthOrder[]>([]);



const [asks,setAsks]=

useState<DepthOrder[]>([]);



const [loading,setLoading]=

useState(true);








useEffect(()=>{


if(!router.isReady)

return;



async function loadDepth(){


try{


const response=

await fetch(

`/api/market/${activePair}/depth`

);



const data=

await response.json();




setBids(data.bids ?? []);

setAsks(data.asks ?? []);




}

catch(error){


console.error(

"Depth Error",

error

);


}

finally{


setLoading(false);


}


}



loadDepth();



},[router.isReady,activePair]);








return (

<DashboardLayout>


<div className="space-y-6">



<h1 className="text-2xl font-bold">


Market Depth:


<span className="text-emerald-400 ml-2">


{activePair.toUpperCase()}


</span>


</h1>





<div className="grid md:grid-cols-2 gap-6">





{/* BIDS */}


<OrderBook

title="BUY ORDERS"

color="text-emerald-400"

orders={bids}

loading={loading}

/>





{/* ASKS */}


<OrderBook

title="SELL ORDERS"

color="text-rose-400"

orders={asks}

loading={loading}

/>




</div>



</div>



</DashboardLayout>


);


}







function OrderBook({

title,

color,

orders,

loading

}:{

title:string;

color:string;

orders:DepthOrder[];

loading:boolean;

}){


return (

<div className="glass p-5">


<h2 className={`font-bold ${color}`}>

{title}

</h2>



<div className="mt-4 space-y-2 text-sm">


{

loading ?


<p>

Loading...

</p>


:


orders.map((item,index)=>(


<div

key={index}

className="flex justify-between"

>


<span>


Rp {item.price.toLocaleString("id-ID")}


</span>



<span className="text-slate-400">


{item.amount}


</span>


</div>


))


}


</div>



</div>


);


}
