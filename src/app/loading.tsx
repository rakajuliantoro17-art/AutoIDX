/**
==========================================================
AURA Trade OS
Global Loading Screen
Version : 0.0.1 Alpha
==========================================================
*/


export default function Loading() {


return (

<div className="min-h-[60vh] flex items-center justify-center">


<div className="glass p-8 text-center max-w-sm w-full">



{/* Spinner */}


<div className="flex justify-center mb-6">


<div

className="

animate-spin

h-14

w-14

rounded-full

border-4

border-sky-400

border-t-transparent

"

/>


</div>





{/* Text */}


<h2 className="text-xl font-semibold">


AutoIDX Engine


</h2>



<p className="mt-2 text-sm text-slate-400">


Loading trading environment...


</p>





{/* Status */}


<div className="mt-6 flex items-center justify-center gap-2">


<span className="status-dot status-online"/>


<span className="text-xs text-slate-400">


System Initializing


</span>


</div>





<p className="mt-5 text-xs text-slate-600">


Version 0.0.1 Alpha


</p>




</div>


</div>


);


}
