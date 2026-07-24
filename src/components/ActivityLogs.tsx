/**
==========================================================
AURA Trade OS
Activity Logs Component
Version : 0.0.1 Alpha
==========================================================
*/


interface LogItem {


id:string;


timestamp:string;


message:string;


type:

"info"

| "success"

| "warning"

| "danger";


}



interface ActivityLogsProps {


logs:LogItem[];


}





export default function ActivityLogs({

logs

}:ActivityLogsProps){





const getTypeStyle = (

type:LogItem["type"]

)=>{


switch(type){


case "success":

return {

color:"text-emerald-400",

icon:"✓"

};



case "warning":

return {

color:"text-amber-400",

icon:"⚠"

};



case "danger":

return {

color:"text-rose-400",

icon:"✖"

};



default:

return {

color:"text-sky-400",

icon:"•"

};


}



};







return (


<div className="glass p-5">





{/* Header */}


<div className="flex justify-between items-center pb-3 mb-4 border-b border-white/10">


<div>


<h3 className="font-semibold text-sm">


Live Activity Logs


</h3>


<p className="text-xs text-slate-500">


Realtime Trading Engine Events


</p>


</div>




<div className="flex items-center gap-2">


<span className="status-dot status-online"/>


<span className="text-xs text-slate-400">


LIVE


</span>


</div>



</div>








{/* Logs */}



<div className="space-y-3 max-h-64 overflow-y-auto pr-2">



{

logs.length === 0 ?



(


<p className="text-sm text-slate-500 italic">


Belum ada aktivitas engine...


</p>


)



:


(


logs.map((log)=>(


<div


key={log.id}


className="fade-in flex gap-3 items-start text-xs font-mono"


>



<span className="text-slate-600 shrink-0">


[{log.timestamp}]


</span>





<span className="shrink-0">


{

getTypeStyle(log.type).icon

}


</span>





<span

className={

getTypeStyle(log.type).color

}

>


{log.message}


</span>




</div>


))


)


}



</div>





</div>


);


}
