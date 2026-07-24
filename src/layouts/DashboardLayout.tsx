/**
==========================================================
AURA Trade OS
Dashboard Layout
Version : 0.0.1 Alpha
==========================================================
*/


import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";



export default function DashboardLayout({

children,

}:{

children:React.ReactNode;

}){


return (

<div className="min-h-screen">


<Header />


<div className="flex">


<Sidebar />


<main className="flex-1 p-6">


{children}


</main>


</div>



<Footer />


</div>


);


}
