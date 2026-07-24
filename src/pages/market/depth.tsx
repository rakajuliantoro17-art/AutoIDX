/**
==========================================================
AURA Trade OS
Market Depth
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";


export default function DepthPage(){


return (

<DashboardLayout>


<div className="grid md:grid-cols-2 gap-6">



<div className="glass p-6">


<h2 className="text-emerald-400 font-bold">

BUY ORDERS

</h2>


<p className="text-slate-400 mt-4">

Waiting order book...

</p>


</div>





<div className="glass p-6">


<h2 className="text-rose-400 font-bold">

SELL ORDERS

</h2>


<p className="text-slate-400 mt-4">

Waiting order book...

</p>


</div>



</div>


</DashboardLayout>

);


}
