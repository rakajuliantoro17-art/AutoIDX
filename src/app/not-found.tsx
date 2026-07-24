/**
==========================================================
AURA Trade OS
Global Not Found Page
Version : 0.0.1 Alpha
==========================================================
*/


import Link from "next/link";



export default function NotFound(){


return (


<div className="min-h-[70vh] flex items-center justify-center p-6">


<div className="glass max-w-lg w-full p-10 text-center">



{/* Error Code */}


<h1 className="text-6xl font-bold brand-gradient">


404


</h1>





<h2 className="mt-5 text-2xl font-semibold">


Route Not Found


</h2>




<p className="mt-3 text-slate-400">


Halaman AutoIDX yang Anda cari tidak tersedia
atau belum dikembangkan pada versi ini.


</p>






{/* System Status */}


<div className="mt-6 rounded-xl bg-white/5 p-4">


<div className="flex items-center justify-center gap-2">


<span className="status-dot status-online"/>


<span className="text-sm text-slate-400">


AutoIDX System Online


</span>


</div>


</div>






{/* Action */}



<Link

href="/dashboard"

className="btn btn-primary mt-8 inline-flex"

>


← Back To Dashboard


</Link>





<p className="mt-6 text-xs text-slate-600">


AutoIDX Trading OS • Version 0.0.1 Alpha


</p>




</div>


</div>


);


}
