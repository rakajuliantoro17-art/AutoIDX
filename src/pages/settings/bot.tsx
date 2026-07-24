/**
==========================================================
AURA Trade OS
Bot Configuration
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";



export default function BotSettings(){


return (

<DashboardLayout>


<div className="card space-y-5">


<h1 className="text-xl font-bold">

Bot Configuration

</h1>



<div>


<label className="text-sm text-slate-400">

Trading Mode

</label>


<select>

<option>

Paper Trading

</option>


<option>

Live Trading

</option>


</select>


</div>





<div>


<label className="text-sm text-slate-400">

Execution Interval

</label>


<input

value="300"

readOnly

/>


</div>




</div>


</DashboardLayout>


);


}
