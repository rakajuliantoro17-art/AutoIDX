/**
==========================================================
AURA Trade OS
Price Chart Component
Version : 0.0.1 Alpha
==========================================================
*/


interface PriceChartProps {

  pair: string;

}


export default function PriceChart({
  pair
}: PriceChartProps) {


  return (

    <div className="glass p-6 rounded-2xl">


      <div className="flex justify-between items-center mb-4">


        <div>

          <h3 className="text-lg font-bold">

            {pair.toUpperCase()} Price Chart

          </h3>


          <p className="text-xs text-slate-400">

            Realtime Market Visualization

          </p>


        </div>


        <span className="text-xs text-emerald-400">

          LIVE

        </span>


      </div>



      <div className="
        h-64
        flex
        items-center
        justify-center
        rounded-xl
        bg-black/20
        border
        border-white/10
      ">


        <p className="text-slate-500 text-sm">

          Trading Chart Engine
          <br/>
          Coming Soon

        </p>


      </div>


    </div>

  );

}
