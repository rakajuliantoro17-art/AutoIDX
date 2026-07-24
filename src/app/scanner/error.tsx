"use client";


export default function ErrorPage({

reset,

}:{

reset:()=>void;

}){


return (

<div className="glass p-8">


<h2 className="text-2xl text-red-400">

Scanner Error

</h2>


<button
onClick={reset}
className="mt-5 rounded-lg bg-white/10 px-4 py-2"
>

Retry

</button>


</div>

);


}
