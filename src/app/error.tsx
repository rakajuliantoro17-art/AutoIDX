/**
==========================================================
AURA Trade OS
Global Error Boundary
Version : 0.0.1 Alpha
==========================================================
*/

"use client";


export default function Error({

    error,

    reset,

}:{

    error: Error;

    reset: () => void;

}){


return (

<div className="min-h-screen flex items-center justify-center p-6">


<div className="glass max-w-lg w-full p-8 text-center">


{/* Icon */}

<div className="text-5xl mb-5">

⚠️

</div>




<h1 className="text-3xl font-bold text-red-400">

AutoIDX Error

</h1>



<p className="text-slate-400 mt-3">

Trading system mengalami gangguan.

</p>





{/* Error Box */}

<div className="mt-6 rounded-xl bg-black/20 p-4 text-left">


<p className="text-xs text-slate-500">

ERROR MESSAGE

</p>



<p className="mt-2 text-sm text-red-300 break-words">

{error.message}

</p>


</div>





{/* Action */}

<button

onClick={reset}

className="btn btn-success mt-8"

>

↻ Restart Engine

</button>





<p className="mt-6 text-xs text-slate-500">

AutoIDX Trading OS • Version 0.0.1 Alpha

</p>


</div>


</div>

);


}
