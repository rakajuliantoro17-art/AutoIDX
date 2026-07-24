/**
==========================================================
AURA Trade OS
Strategy Settings
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";



export default function StrategySettings(){


return (

<DashboardLayout>


<div className="card">


<h1 className="text-xl font-bold">

Strategy Parameters

</h1>



<div className="mt-5 space-y-3 text-sm">


<p>

EMA Fast :

<span className="text-sky-400">

9

</span>

</p>


<p>

EMA Slow :

<span className="text-sky-400">

21

</span>

</p>


<p>

RSI Period :

<span className="text-sky-400">

14

</span>

</p>


<p>

Strategy :

<span className="text-emerald-400">

EMA + RSI

</span>

</p>


</div>



</div>


</DashboardLayout>


);


}
