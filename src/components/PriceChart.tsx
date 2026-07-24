/**
==========================================================
AURA Trade OS
Price Chart Component
Version : 0.0.1 Alpha
==========================================================
*/


interface PricePoint {

  time:string;

  price:number;

}



interface PriceChartProps {

  data:PricePoint[];

  pair?:string;

}





export default function PriceChart({

data,

pair="BTC/IDR"

}:PriceChartProps){





if(!data || data.length===0){


return (

<div className="glass p-6">


<h3 className="font-semibold">


{pair} Price Chart


</h3>



<p className="mt-6 text-sm text-slate-500">


Waiting market data...


</p>


</div>

);


}






const prices=data.map(

item=>item.price

);



const max=Math.max(...prices);

const min=Math.min(...prices);



const width=600;

const height=220;





const points=data.map(

(item,index)=>{


const x=

(index/(data.length-1))

*

width;



const y=

height -

(

((item.price-min)

/

(max-min))

*

height

);



return `${x},${y}`;

}


).join(" ");








return (


<div className="glass p-5">





{/* Header */}



<div className="flex justify-between items-center mb-5">


<div>


<h3 className="font-semibold">


{pair}


</h3>


<p className="text-xs text-slate-500">


Realtime Market Price


</p>


</div>





<div className="text-right">


<p className="text-xs text-slate-500">


LAST PRICE


</p>


<p className="text-emerald-400 font-semibold">


Rp {prices[prices.length-1].toLocaleString("id-ID")}


</p>


</div>



</div>








{/* Chart */}



<div className="overflow-hidden">


<svg

viewBox={`0 0 ${width} ${height}`}

className="w-full h-56"


>



<polyline


fill="none"


stroke="currentColor"


className="text-sky-400"


strokeWidth="3"


points={points}


/>



</svg>


</div>







{/* Range */}


<div className="flex justify-between text-xs text-slate-500 mt-4">


<span>


Low:

Rp {min.toLocaleString("id-ID")}


</span>


<span>


High:

Rp {max.toLocaleString("id-ID")}


</span>


</div>






</div>


);


}
