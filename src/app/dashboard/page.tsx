/**
==========================================================
AURA Trade OS
Dashboard Main Page
Version : 0.0.1 Alpha
==========================================================
*/

import Activity from "./activity";
import Backtest from "./backtest";


export default function Dashboard() {


  const botStatus = {

    mode: "PAPER",

    status: "RUNNING",

    pairsScanned: 0,

    buySignals: 0,

    sellSignals: 0,

    orders: 0,

  };


  return (

    <section className="space-y-8">


      {/* Header */}

      <div className="glass p-8">


        <div className="flex justify-between items-center">


          <div>


            <h1 className="text-3xl font-bold">

              AutoIDX Dashboard

            </h1>


            <p className="mt-2 text-slate-400">

              Automated Indodax Trading Control Center

            </p>


          </div>


          <div className="flex items-center gap-3">


            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"/>


            <span className="text-sm text-emerald-400">

              System Active

            </span>


          </div>


        </div>


      </div>



      {/* Bot Status */}

      <div className="grid gap-6 md:grid-cols-4">


        <div className="card">


          <p className="text-sm text-slate-400">

            Mode

          </p>


          <h2 className="text-2xl font-bold mt-2 text-yellow-400">

            {botStatus.mode}

          </h2>


        </div>



        <div className="card">


          <p className="text-sm text-slate-400">

            Status

          </p>


          <h2 className="text-2xl font-bold mt-2 text-emerald-400">

            {botStatus.status}

          </h2>


        </div>



        <div className="card">


          <p className="text-sm text-slate-400">

            Pair Scanned

          </p>


          <h2 className="text-2xl font-bold mt-2">

            {botStatus.pairsScanned}

          </h2>


        </div>



        <div className="card">


          <p className="text-sm text-slate-400">

            Orders

          </p>


          <h2 className="text-2xl font-bold mt-2">

            {botStatus.orders}

          </h2>


        </div>


      </div>




      {/* Signal Monitor */}

      <div className="grid gap-6 md:grid-cols-3">


        <div className="card">


          <p className="text-sm text-slate-400">

            BUY Signal

          </p>


          <h2 className="text-3xl font-bold text-emerald-400 mt-2">

            {botStatus.buySignals}

          </h2>


        </div>



        <div className="card">


          <p className="text-sm text-slate-400">

            SELL Signal

          </p>


          <h2 className="text-3xl font-bold text-red-400 mt-2">

            {botStatus.sellSignals}

          </h2>


        </div>



        <div className="card">


          <p className="text-sm text-slate-400">

            Risk Engine

          </p>


          <h2 className="text-3xl font-bold text-sky-400 mt-2">

            READY

          </h2>


        </div>


      </div>





      {/* Dashboard Widgets */}

      <div className="grid gap-6 lg:grid-cols-2">


        <Activity />


        <Backtest />


      </div>



      {/* Future AI Panel */}

      <div className="card">


        <h2 className="text-xl font-semibold">

          AI Trading Assistant

        </h2>


        <p className="mt-3 text-slate-400">

          Machine Learning prediction engine akan
          tersedia pada versi berikutnya.

        </p>


      </div>



    </section>

  );

}
