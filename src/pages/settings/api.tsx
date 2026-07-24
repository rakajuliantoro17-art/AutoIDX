/**
==========================================================
AURA Trade OS
API Settings
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";



export default function APISettings(){


return (

<DashboardLayout>


<div className="card">


<h1 className="text-xl font-bold">

Exchange API

</h1>



<div className="mt-5 space-y-3">


<p>

Exchange:

<span className="text-sky-400">

Indodax

</span>

</p>


<p>

API Key:

<span className="text-emerald-400">

CONNECTED

</span>

</p>


<p>

Private API:

<span className="text-emerald-400">

READY

</span>

</p>



</div>



</div>


</DashboardLayout>


);


}
