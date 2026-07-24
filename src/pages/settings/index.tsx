/**
==========================================================
AURA Trade OS
Settings Overview
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";



export default function SettingsPage(){


return (

<DashboardLayout>


<div className="space-y-6">


<div>


<h1 className="text-2xl font-bold">

System Settings

</h1>


<p className="text-xs text-slate-400 mt-1">

Konfigurasi AutoIDX Trading Engine

</p>


</div>





<div className="grid md:grid-cols-3 gap-5">



<div className="card">


<h2 className="font-bold">

Trading Mode

</h2>


<p className="text-emerald-400 mt-3">

PAPER

</p>


</div>





<div className="card">


<h2 className="font-bold">

Exchange

</h2>


<p className="text-sky-400 mt-3">

INDODAX

</p>


</div>





<div className="card">


<h2 className="font-bold">

Bot Status

</h2>


<p className="text-emerald-400 mt-3">

ACTIVE

</p>


</div>



</div>




</div>


</DashboardLayout>

);


}
