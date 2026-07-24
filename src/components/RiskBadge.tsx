/**
==========================================================
AURA Trade OS
Risk Badge Component
Version : 0.0.1 Alpha
==========================================================
*/


interface RiskBadgeProps {


signal:

"BUY"

| "SELL"

| "HOLD"

| "LOW"

| "MEDIUM"

| "HIGH"

| string;



confidence?:number;


}




export default function RiskBadge({

signal,

confidence

}:RiskBadgeProps){





const getStyle=()=>{


switch(signal){


case "BUY":

return {

style:

"bg-emerald-500/10 text-emerald-400 border-emerald-500/30",

dot:

"bg-emerald-400",

icon:"▲"

};



case "SELL":

return {

style:

"bg-rose-500/10 text-rose-400 border-rose-500/30",

dot:

"bg-rose-400",

icon:"▼"

};



case "HIGH":

return {

style:

"bg-red-500/10 text-red-400 border-red-500/30",

dot:

"bg-red-400",

icon:"⚠"

};



case "MEDIUM":

return {

style:

"bg-amber-500/10 text-amber-400 border-amber-500/30",

dot:

"bg-amber-400",

icon:"!"

};



case "LOW":

return {

style:

"bg-sky-500/10 text-sky-400 border-sky-500/30",

dot:

"bg-sky-400",

icon:"✓"

};



default:


return {

style:

"bg-slate-700/30 text-slate-400 border-slate-600/40",

dot:

"bg-slate-400",

icon:"•"

};


}



};





const config=getStyle();






return (



<span

className={`

inline-flex

items-center

gap-2

px-3

py-1.5

rounded-full

text-xs

font-semibold

border

${config.style}

`}

>



<span

className={`

h-2

w-2

rounded-full

${config.dot}

${

signal==="BUY"

||

signal==="SELL"

?

"animate-pulse"

:""

}

`}

/>



<span>


{config.icon}

</span>




<span>


{signal}


</span>





{

confidence &&

(


<span className="opacity-70">


{confidence}%


</span>


)

}





</span>



);


}
