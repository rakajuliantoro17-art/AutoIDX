/**
==========================================================
AURA Trade OS
Market Ticker
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";


export default function TickerPage(){


return (

<DashboardLayout>


<div className="card">


<h1 className="text-xl font-bold">

Market Ticker

</h1>


<div className="mt-5 space-y-3 text-sm">


<p>

Pair :

BTC_IDR

</p>


<p>

Last Price :

Loading...

</p>


<p>

High :

Loading...

</p>


<p>

Low :

Loading...

</p>


<p>

Volume :

Loading...

</p>


</div>


</div>


</DashboardLayout>

);


}
