/**
==========================================================
AURA Trade OS
Transaction History
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";



interface OrderHistory {


id:string;


type:

"BUY"

|

"SELL";



pair:string;



price:string;



amount:string;



total:string;



profit?:string;



timestamp:string;



status:

"FILLED"

|

"PENDING"

|

"FAILED";


}





export default function HistoryPage(){



const transactions:OrderHistory[]=[


{

id:"ORD-9821",

type:"BUY",

pair:"BTC_IDR",

price:"Rp 1.020.000.000",

amount:"0.00004901 BTC",

total:"Rp 50.000",

timestamp:"2026-07-20 10:15:00",

status:"FILLED"

},



{

id:"ORD-9822",

type:"SELL",

pair:"BTC_IDR",

price:"Rp 1.060.800.000",

amount:"0.00004901 BTC",

total:"Rp 52.000",

profit:"+Rp 2.000",

timestamp:"2026-07-21 14:30:00",

status:"FILLED"

}



];





return (

<DashboardLayout>


<div className="space-y-6">





{/* Header */}


<div>


<h1 className="text-2xl font-bold">


Transaction History


</h1>


<p className="text-xs text-slate-400 mt-1">


Riwayat eksekusi order AutoIDX Engine


</p>


</div>







{/* Summary */}


<div className="grid md:grid-cols-4 gap-5">



<div className="card">

<p className="text-xs text-slate-400">

Total Orders

</p>

<p className="text-2xl font-bold mt-2">

{transactions.length}

</p>

</div>





<div className="card">

<p className="text-xs text-slate-400">

BUY Orders

</p>

<p className="text-2xl font-bold text-emerald-400 mt-2">

{
transactions.filter(

x=>x.type==="BUY"

).length

}

</p>

</div>





<div className="card">

<p className="text-xs text-slate-400">

SELL Orders

</p>

<p className="text-2xl font-bold text-rose-400 mt-2">

{
transactions.filter(

x=>x.type==="SELL"

).length

}

</p>

</div>





<div className="card">

<p className="text-xs text-slate-400">

Mode

</p>

<p className="text-xl font-bold text-sky-400 mt-2">

PAPER

</p>

</div>



</div>









{/* Table */}



<div className="glass overflow-hidden">


<div className="overflow-x-auto">



<table className="w-full text-sm">



<thead className="bg-white/5 text-slate-400">


<tr>


<th className="p-4 text-left">
ID
</th>


<th className="p-4">
TYPE
</th>


<th className="p-4">
PAIR
</th>


<th className="p-4">
PRICE
</th>


<th className="p-4">
AMOUNT
</th>


<th className="p-4">
TOTAL
</th>


<th className="p-4">
PROFIT
</th>


<th className="p-4">
STATUS
</th>


</tr>


</thead>





<tbody>


{

transactions.map(tx=>(


<tr

key={tx.id}

className="border-t border-white/10 hover:bg-white/5"

>


<td className="p-4 text-slate-400">

{tx.id}

</td>



<td className="p-4">


<span

className={

tx.type==="BUY"

?

"text-emerald-400"

:

"text-rose-400"

}

>

{tx.type}

</span>


</td>



<td className="p-4">

{tx.pair}

</td>



<td className="p-4">

{tx.price}

</td>



<td className="p-4">

{tx.amount}

</td>



<td className="p-4">

{tx.total}

</td>



<td className="p-4 text-emerald-400">

{tx.profit ?? "-"}

</td>



<td className="p-4">


<span className="text-emerald-400">


● {tx.status}


</span>


</td>



</tr>


))


}


</tbody>



</table>


</div>


</div>





</div>


</DashboardLayout>

);


}
