/**
==========================================================
AURA Trade OS
Market Scanner
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";


export default function ScannerPage(){


const pairs=[

"BTC_IDR",

"ETH_IDR",

"SOL_IDR"

];



return (

<DashboardLayout>


<div className="space-y-5">


<h1 className="text-2xl font-bold">

Market Scanner

</h1>



<div className="grid md:grid-cols-3 gap-5">


{

pairs.map(pair=>(


<div

key={pair}

className="card"

>


<h2 className="font-bold">

{pair}

</h2>


<p className="text-sm text-slate-400 mt-2">

Signal:

<span className="text-slate-300">

 HOLD

</span>

</p>


</div>


))


}


</div>



</div>


</DashboardLayout>

);


}
