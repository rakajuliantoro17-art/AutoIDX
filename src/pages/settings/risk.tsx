/**
==========================================================
AURA Trade OS
Risk Settings
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";



export default function RiskSettings(){


return (

<DashboardLayout>


<div className="card space-y-4">


<h1 className="text-xl font-bold">

Risk Management

</h1>



<div>

<p className="text-slate-400 text-sm">

Stop Loss

</p>

<p className="text-rose-400 font-bold">

1%

</p>

</div>




<div>

<p className="text-slate-400 text-sm">

Take Profit

</p>


<p className="text-emerald-400 font-bold">

3%

</p>

</div>





<div>

<p className="text-slate-400 text-sm">

Max Position

</p>


<p>

3

</p>

</div>



</div>


</DashboardLayout>


);


}
