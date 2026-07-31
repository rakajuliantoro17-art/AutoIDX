/**
==========================================================
AURA Trade OS
Dashboard Settings Widget
Version : 0.0.1 Alpha
==========================================================
*/


interface BotSettings {

  mode: "PAPER" | "LIVE";

  tradeAmount: number;

  targetProfit: number;

  stopLoss: number;

  maxPositions: number;

  confidence: number;

}



const settings: BotSettings = {


  mode: "PAPER",


  tradeAmount: 25000,


  targetProfit: 3,


  stopLoss: 2,


  maxPositions: 3,


  confidence: 75,


};




export default function Settings(){


  return (


    <section className="card">


      {/* Header */}

      <div className="flex justify-between items-center mb-6">


        <div>


          <h2 className="text-xl font-semibold">

            Trading Settings

          </h2>


          <p className="text-sm text-slate-400">

            Bot configuration parameters

          </p>


        </div>



        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            settings.mode === "LIVE"
            ? "bg-red-500/20 text-red-400"
            : "bg-yellow-500/20 text-yellow-400"
          }`}
        >

          {settings.mode}

        </span>


      </div>





      {/* Parameters */}

      <div className="space-y-5">



        <div className="grid grid-cols-2 gap-5">


          <div>


            <p className="text-xs text-slate-500">

              Trade Amount

            </p>


            <p className="font-bold mt-1">

              Rp {settings.tradeAmount.toLocaleString("id-ID")}

            </p>


          </div>



          <div>


            <p className="text-xs text-slate-500">

              Daily Target

            </p>


            <p className="font-bold text-emerald-400 mt-1">

              {settings.targetProfit}%

            </p>


          </div>


        </div>





        <div className="grid grid-cols-2 gap-5">


          <div>


            <p className="text-xs text-slate-500">

              Stop Loss

            </p>


            <p className="font-bold text-red-400 mt-1">

              {settings.stopLoss}%

            </p>


          </div>



          <div>


            <p className="text-xs text-slate-500">

              Max Position

            </p>


            <p className="font-bold mt-1">

              {settings.maxPositions} Coins

            </p>


          </div>


        </div>





        {/* AI Confidence */}

        <div className="rounded-xl bg-white/5 p-4">


          <div className="flex justify-between">


            <span className="text-sm text-slate-400">

              Minimum AI Confidence

            </span>



            <span className="font-bold text-sky-400">

              {settings.confidence}%

            </span>


          </div>



          <div className="mt-3 h-2 rounded-full bg-white/10">


            <div

              className="h-2 rounded-full bg-sky-500"

              style={{
                width:`${settings.confidence}%`
              }}

            />


          </div>


        </div>





        {/* Future Controls */}

        <div className="border border-dashed border-white/10 rounded-xl p-4">


          <p className="text-sm text-slate-400">

            Configuration editor akan tersedia pada versi berikutnya.

          </p>


        </div>



      </div>


    </section>


  );


}
