/**
==========================================================
AURA Trade OS
Home Landing
Version : 0.0.1 Alpha
==========================================================
*/


import Link from "next/link";



export default function HomePage(){


return (


<section className="space-y-8">



{/* =====================================================
    HERO
===================================================== */}


<div className="glass p-10">


<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">



<div>


<h1 className="text-5xl font-bold">


<span className="brand-gradient">

AutoIDX

</span>


</h1>




<h2 className="mt-3 text-xl text-slate-300">


Automated Indodax Trading Engine


</h2>




<p className="mt-5 text-slate-400 max-w-xl">


AI-assisted crypto trading system yang melakukan
market scanning, technical analysis, risk management,
dan automated execution secara modular.


</p>



</div>





{/* BOT STATUS */}


<div className="glass p-5 min-w-[220px]">


<div className="flex items-center gap-3">


<span className="status-dot status-online"/>


<span className="text-sm text-slate-300">


System Ready


</span>


</div>



<div className="mt-4">


<p className="text-xs text-slate-500">


MODE


</p>


<p className="font-semibold text-emerald-400">


PAPER TRADING


</p>


</div>



<div className="mt-3">


<p className="text-xs text-slate-500">


VERSION


</p>


<p className="text-sm">


0.0.1 Alpha


</p>


</div>



</div>



</div>


</div>









{/* =====================================================
    MODULE MENU
===================================================== */}



<div className="grid md:grid-cols-3 gap-6">



<Link

href="/dashboard"

className="card hover:scale-[1.02] transition"

>


<h3 className="text-xl font-semibold">


📊 Dashboard


</h3>


<p className="mt-2 text-sm text-slate-400">


Monitoring bot activity, signal,
dan execution status.


</p>


</Link>






<Link

href="/scanner"

className="card hover:scale-[1.02] transition"

>


<h3 className="text-xl font-semibold">


🔎 Market Scanner


</h3>


<p className="mt-2 text-sm text-slate-400">


Scan banyak pair Indodax
untuk mencari peluang BUY.


</p>


</Link>







<Link

href="/portfolio"

className="card hover:scale-[1.02] transition"

>


<h3 className="text-xl font-semibold">


💰 Portfolio


</h3>


<p className="mt-2 text-sm text-slate-400">


Balance, asset,
dan performa trading.


</p>


</Link>



</div>









{/* =====================================================
    CORE ENGINE STATUS
===================================================== */}



<div className="grid md:grid-cols-4 gap-4">



<div className="card">


<p className="text-xs text-slate-500">


ENGINE


</p>


<p className="mt-2 text-emerald-400">


ONLINE


</p>


</div>






<div className="card">


<p className="text-xs text-slate-500">


MARKET DATA


</p>


<p className="mt-2 text-sky-400">


READY


</p>


</div>






<div className="card">


<p className="text-xs text-slate-500">


RISK ENGINE


</p>


<p className="mt-2 text-yellow-400">


ACTIVE


</p>


</div>






<div className="card">


<p className="text-xs text-slate-500">


AI MODULE


</p>


<p className="mt-2 text-slate-400">


COMING SOON


</p>


</div>





</div>






</section>


);


}
