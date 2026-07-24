/**
==========================================================
AURA Trade OS
Technical Analytics Page
Version : 0.0.1 Alpha
==========================================================
*/


import DashboardLayout from "@/layouts/DashboardLayout";
import RiskBadge from "@/components/RiskBadge";



export default function AnalyticsPage(){


return (


<DashboardLayout>


<div className="space-y-6">





{/* Header */}

<div>


<h1 className="text-2xl font-bold">


Technical Analytics


</h1>



<p className="text-xs text-slate-400 mt-1">


EMA + RSI Strategy Analysis BTC/IDR


</p>


</div>







{/* Indicator Cards */}



<div className="grid grid-cols-1 md:grid-cols-4 gap-5">





<div className="card">


<p className="text-xs text-slate-400">


EMA Fast (9)


</p>


<p className="text-xl font-bold text-emerald-400 mt-2">


1,045,200,000


</p>


</div>






<div className="card">


<p className="text-xs text-slate-400">


EMA Slow (21)


</p>


<p className="text-xl font-bold mt-2">


1,042,100,000


</p>


</div>








<div className="card">


<p className="text-xs text-slate-400">


RSI (14)


</p>


<p className="text-xl font-bold text-sky-400 mt-2">


48.5


</p>


</div>







<div className="card">


<p className="text-xs text-slate-400">


Signal


</p>


<div className="mt-3">


<RiskBadge

signal="BUY"

confidence={82}

/>


</div>


</div>





</div>









{/* Analysis Panel */}



<div className="glass p-8">


<h2 className="font-semibold">


Strategy Evaluation


</h2>



<div className="mt-4 space-y-3 text-sm text-slate-300">



<p>

✓ EMA Fast berada di atas EMA Slow

</p>


<p>

✓ RSI masih dalam area aman

</p>


<p>

✓ Trend terdeteksi bullish

</p>


</div>



</div>






</div>


</DashboardLayout>


);


}
