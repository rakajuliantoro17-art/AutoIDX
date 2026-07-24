/**
==========================================================
AURA Trade OS
Dashboard Overview
Version : 0.0.1 Alpha
==========================================================
*/

import StatusCard from "@/components/StatusCard";
import PriceChart from "@/components/PriceChart";
import RiskBadge from "@/components/RiskBadge";


export default function DashboardOverview(){

return (

<div className="space-y-6">


<div className="grid md:grid-cols-4 gap-5">


<StatusCard

title="Balance"

value="Rp 100.000"

icon="💰"

/>


<StatusCard

title="Profit"

value="+0%"

trend="neutral"

icon="📈"

/>


<StatusCard

title="Active Pair"

value="BTC_IDR"

icon="🪙"

/>


<StatusCard

title="Bot Status"

value="RUNNING"

trend="up"

icon="🤖"

/>


</div>



<div className="grid lg:grid-cols-3 gap-6">


<div className="lg:col-span-2">


<PriceChart

pair="BTC/IDR"

data={[]}

/>


</div>



<div>


<RiskBadge

signal="HOLD"

confidence={50}

/>


</div>


</div>


</div>

);


}
