/**
==========================================================
AURA Trade OS
Dashboard Portfolio Widget
Version : 0.0.1 Alpha
==========================================================
*/


interface PortfolioData {

  balanceIDR: number;

  asset: string;

  amount: number;

  avgBuyPrice: number;

  currentPrice: number;

  pnl: number;

  pnlPercent: number;

}


const portfolio: PortfolioData = {


  balanceIDR: 1000000,


  asset: "BTC",


  amount: 0,


  avgBuyPrice: 0,


  currentPrice: 0,


  pnl: 0,


  pnlPercent: 0,


};



export default function Portfolio(){


  return (

    <section className="card">


      {/* Header */}

      <div className="flex justify-between items-center mb-6">


        <div>


          <h2 className="text-xl font-semibold">

            Portfolio

          </h2>


          <p className="text-sm text-slate-400">

            Current trading position

          </p>


        </div>


        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-400">

          PAPER MODE

        </span>


      </div>



      {/* Balance */}

      <div className="space-y-5">


        <div>


          <p className="text-xs text-slate-500">

            IDR Balance

          </p>


          <h3 className="text-2xl font-bold mt-1">

            Rp {portfolio.balanceIDR.toLocaleString("id-ID")}

          </h3>


        </div>





        <div className="grid grid-cols-2 gap-5">


          <div>


            <p className="text-xs text-slate-500">

              Asset

            </p>


            <p className="font-semibold mt-1">

              {portfolio.asset}

            </p>


          </div>



          <div>


            <p className="text-xs text-slate-500">

              Amount

            </p>


            <p className="font-semibold mt-1">

              {portfolio.amount}

            </p>


          </div>


        </div>





        <div className="grid grid-cols-2 gap-5">


          <div>


            <p className="text-xs text-slate-500">

              Avg Buy

            </p>


            <p className="font-semibold mt-1">

              Rp {portfolio.avgBuyPrice.toLocaleString("id-ID")}

            </p>


          </div>




          <div>


            <p className="text-xs text-slate-500">

              Current Price

            </p>


            <p className="font-semibold mt-1">

              Rp {portfolio.currentPrice.toLocaleString("id-ID")}

            </p>


          </div>


        </div>




        {/* PNL */}

        <div className="rounded-xl bg-white/5 p-4">


          <p className="text-xs text-slate-500">

            Unrealized PnL

          </p>


          <div className="flex justify-between mt-2">


            <span className="text-xl font-bold text-emerald-400">

              Rp {portfolio.pnl.toLocaleString("id-ID")}

            </span>


            <span className="text-xl font-bold text-emerald-400">

              {portfolio.pnlPercent}%

            </span>


          </div>


        </div>



      </div>


    </section>

  );


}
