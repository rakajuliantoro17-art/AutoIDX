/**
==========================================================
AURA Trade OS
Dashboard Header
Version : 0.0.1 Alpha
==========================================================
*/


export default function Header(){


return (

<header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">


<div className="h-16 px-6 flex items-center justify-between">


<div>


<h1 className="text-xl font-bold">

Auto<span className="text-sky-400">IDX</span>

</h1>


<p className="text-xs text-slate-500">

Automated Trading Engine

</p>


</div>




<div className="flex items-center gap-3">


<span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"/>


<span className="text-sm text-slate-300">

SYSTEM ACTIVE

</span>


</div>



</div>


</header>

);


}
