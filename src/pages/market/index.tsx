/**
==========================================================
AURA Trade OS
Market Overview
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";
import StatusCard from "@/components/StatusCard";


export default function MarketPage(){


return (

<DashboardLayout>


<div className="space-y-6">


<div>

<h1 className="text-2xl font-bold">

Market Overview

</h1>


<p className="text-xs text-slate-400 mt-1">

Realtime Indodax Market Monitoring

</p>


</div>





<div className="grid md:grid-cols-4 gap-5">


<StatusCard

title="Pair"

value="BTC/IDR"

/>


<StatusCard

title="Last Price"

value="Rp 0"

/>


<StatusCard

title="24H Volume"

value="0 BTC"

/>


<StatusCard

title="Market Trend"

value="NEUTRAL"

/>



</div>





<div className="glass p-8">


<h2 className="font-semibold">

Market Data Stream

</h2>


<p className="text-sm text-slate-400 mt-3">

Waiting for Indodax ticker feed...

</p>


</div>




</div>


</DashboardLayout>

);


}
