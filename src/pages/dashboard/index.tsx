/**
==========================================================
AURA Trade OS
Executive Dashboard
Version : 0.0.1 Alpha
==========================================================
*/


"use client";


import {
useEffect,
useState
} from "react";


import DashboardLayout from "@/layouts/DashboardLayout";

import StatusCard from "@/components/StatusCard";

import RiskBadge from "@/components/RiskBadge";

import PriceChart from "@/components/PriceChart";

import ActivityLogs from "@/components/ActivityLogs";





interface DashboardData {


price:number;


rsi:number;


signal:

"BUY"

|

"SELL"

|

"HOLD";


position:string;


loading:boolean;


}






export default function DashboardPage(){



const [data,setData]=useState<DashboardData>({


price:0,


rsi:50,


signal:"HOLD",


position:"OUT OF POSITION",


loading:true


});






const logs=[


{

id:"1",

timestamp:"16:00:00",

message:"Vercel Cron triggered",

type:"info" as const

},



{

id:"2",

timestamp:"16:00:02",

message:"BTC/IDR market data received",

type:"success" as const

},



{

id:"3",

timestamp:"16:00:03",

message:"Strategy result HOLD",

type:"info" as const

}



];







useEffect(()=>{


async function loadMarket(){


try{


const res=

await fetch("/api/market");



const json=

await res.json();



setData({

price:json.lastPrice,

rsi:json.rsi,

signal:json.signal,

position:

json.inPosition

?

"ACTIVE POSITION"

:

"OUT OF POSITION",

loading:false


});



}

catch(error){


console.error(

error

);


}


}



loadMarket();



},[]);







return (


<DashboardLayout>



<div className="space-y-6">





{/* Header */}



<div className="flex justify-between items-center">


<div>


<h1 className="text-2xl font-bold">

Bot Executive Overview

</h1>


<p className="text-xs text-slate-400">

Serverless Trading Monitoring

</p>


</div>



<RiskBadge

signal={data.signal}

/>



</div>









{/* Metrics */}



<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">





<StatusCard


title="BTC/IDR Price"


value={

data.loading

?

"..."

:

`Rp ${data.price.toLocaleString("id-ID")}`

}


subtext="Indodax ticker"


loading={data.loading}


/>






<StatusCard


title="RSI"


value={

data.loading

?

"..."

:

data.rsi

}


subtext="Period 14"


loading={data.loading}


/>







<StatusCard


title="Position"


value={data.position}


/>







<StatusCard


title="Risk"


value="1% / 3%"


subtext="SL / TP"


/>






</div>









{/* Main Area */}



<div className="grid lg:grid-cols-3 gap-6">





<div className="lg:col-span-2">


<PriceChart

pair="btc_idr"

/>


</div>






<ActivityLogs

logs={logs}

/>




</div>





</div>


</DashboardLayout>


);


}
