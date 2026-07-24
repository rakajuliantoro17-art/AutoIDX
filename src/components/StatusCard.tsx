/**
==========================================================
AURA Trade OS
Status Card Component
Version : 0.0.1 Alpha
==========================================================
*/


interface StatusCardProps {


title:string;


value:string | number;


subtext?:string;


trend?:

"up"

|

"down"

|

"neutral";



icon?:string;


loading?:boolean;


}




export default function StatusCard({

title,

value,

subtext,

trend="neutral",

icon,

loading=false

}:StatusCardProps){





const trendStyle=()=>{


switch(trend){


case "up":

return {

text:"text-emerald-400",

border:"border-emerald-500/20"

};



case "down":

return {

text:"text-rose-400",

border:"border-rose-500/20"

};



default:

return {

text:"text-slate-200",

border:"border-white/10"

};


}



};





const style=trendStyle();





return (


<div

className={`

card

border

${style.border}

hover:scale-[1.02]

transition

duration-200

`}

>






{/* Header */}

<div className="flex items-center justify-between">


<div>


<p className="text-xs uppercase tracking-wider text-slate-400">


{title}


</p>


</div>





{

icon &&

(

<span className="text-xl">


{icon}


</span>

)

}



</div>









{/* Value */}



<div className="mt-4">


{

loading ?



(


<div

className="

h-8

w-28

rounded-lg

bg-white/10

animate-pulse

"

/>


)


:



(


<p

className={`

text-3xl

font-bold

tracking-tight

${style.text}

`}

>


{value}


</p>


)


}



</div>








{/* Subtext */}



{

subtext &&

(


<p className="mt-3 text-xs text-slate-500">


{subtext}


</p>


)


}





</div>


);


}
