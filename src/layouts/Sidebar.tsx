/**
==========================================================
AURA Trade OS
Dashboard Sidebar
Version : 0.0.1 Alpha
==========================================================
*/


import Link from "next/link";



const menus=[

{
name:"Dashboard",
path:"/dashboard"
},

{
name:"Scanner",
path:"/scanner"
},

{
name:"Portfolio",
path:"/portfolio"
},

{
name:"Activity",
path:"/activity"
},

{
name:"Backtest",
path:"/backtest"
},

{
name:"Settings",
path:"/settings"
}

];




export default function Sidebar(){


return (

<aside className="hidden md:block w-64 border-r border-white/10 min-h-[calc(100vh-64px)] p-4">


<nav className="space-y-2">


{

menus.map(menu=>(


<Link

key={menu.path}

href={menu.path}

className="
block
px-4
py-3
rounded-xl
text-sm
text-slate-300
hover:bg-white/10
transition
"

>


{menu.name}


</Link>


))

}



</nav>


</aside>


);


}
