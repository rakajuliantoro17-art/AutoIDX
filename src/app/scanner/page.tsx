/**
==========================================================
AURA Trade OS
Market Scanner Page
Version : 0.0.1 Alpha
==========================================================
*/


interface MarketScan {

  pair:string;

  price:number;

  change:number;

  rsi:number;

  trend:string;

  signal:
  | "BUY"
  | "SELL"
  | "HOLD";

  confidence:number;

}


const markets:MarketScan[] = [

  {
    pair:"BTC/IDR",
    price:0,
    change:0,
    rsi:50,
    trend:"Neutral",
    signal:"HOLD",
    confidence:50,
  },


  {
    pair:"ETH/IDR",
    price:0,
    change:0,
    rsi:50,
    trend:"Neutral",
    signal:"HOLD",
    confidence:50,
  },


  {
    pair:"SOL/IDR",
    price:0,
    change:0,
    rsi:50,
    trend:"Neutral",
    signal:"HOLD",
    confidence:50,
  },

];



function signalBadge(
 signal:MarketScan["signal"]
){

  if(signal==="BUY")
    return "bg-emerald-500/20 text-emerald-400";


  if(signal==="SELL")
    return "bg-red-500/20 text-red-400";


  return "bg-slate-500/20 text-slate-400";

}



export default function ScannerPage(){


return (

<section className="space-y-8">


{/* Header */}

<div className="glass p-8">


<h1 className="text-3xl font-bold">

Market Scanner

</h1>


<p className="text-slate-400 mt-2">

Multi asset opportunity detection engine

</p>


</div>





{/* Summary */}

<div className="grid gap-6 md:grid-cols-4">


<div className="card">

<p className="text-sm text-slate-400">

Pairs Scanned

</p>

<h2 className="text-3xl font-bold mt-2">

{markets.length}

</h2>

</div>



<div className="card">

<p className="text-sm text-slate-400">

BUY Opportunity

</p>

<h2 className="text-3xl font-bold text-emerald-400 mt-2">

0

</h2>

</div>



<div className="card">

<p className="text-sm text-slate-400">

Average Confidence

</p>

<h2 className="text-3xl font-bold text-sky-400 mt-2">

50%

</h2>

</div>



<div className="card">

<p className="text-sm text-slate-400">

Scanner Status

</p>

<h2 className="text-3xl font-bold text-yellow-400 mt-2">

READY

</h2>

</div>


</div>







{/* Market Table */}

<div className="card">


<h2 className="text-xl font-semibold mb-6">

Market Opportunity Ranking

</h2>



<div className="overflow-x-auto">


<table className="w-full">


<thead>

<tr className="border-b border-white/10 text-slate-400">


<th className="text-left py-3">

Pair

</th>


<th className="text-left">

Price

</th>


<th className="text-left">

Change

</th>


<th className="text-left">

RSI

</th>


<th className="text-left">

Trend

</th>


<th className="text-left">

Signal

</th>


<th className="text-left">

Confidence

</th>


</tr>

</thead>




<tbody>


{markets.map((item)=>(


<tr
key={item.pair}
className="border-b border-white/5"
>


<td className="py-4 font-semibold">

{item.pair}

</td>



<td>

Rp {item.price.toLocaleString("id-ID")}

</td>



<td>

{item.change}%

</td>



<td>

{item.rsi}

</td>



<td>

{item.trend}

</td>



<td>


<span
className={`rounded-full px-3 py-1 text-xs font-semibold ${signalBadge(item.signal)}`}
>

{item.signal}

</span>


</td>



<td>

{item.confidence}%

</td>


</tr>


))}


</tbody>


</table>


</div>


</div>







{/* AI Future */}

<div className="card">


<h2 className="text-xl font-semibold">

AI Market Intelligence

</h2>


<p className="text-slate-400 mt-3">

Machine Learning ranking engine akan menganalisa
probabilitas profit setiap coin pada versi berikutnya.

</p>


</div>




</section>

);


}
