/**
==========================================================
AURA Trade OS
Dashboard Market Scanner Widget
Version : 0.0.1 Alpha
==========================================================
*/


interface MarketOpportunity {

  pair: string;

  price: number;

  change: number;

  rsi: number;

  signal: "BUY" | "HOLD" | "SELL";

  confidence: number;

}



const markets: MarketOpportunity[] = [


  {
    pair: "BTC/IDR",
    price: 0,
    change: 0,
    rsi: 50,
    signal: "HOLD",
    confidence: 50,
  },


  {
    pair: "ETH/IDR",
    price: 0,
    change: 0,
    rsi: 50,
    signal: "HOLD",
    confidence: 50,
  },


  {
    pair: "SOL/IDR",
    price: 0,
    change: 0,
    rsi: 50,
    signal: "HOLD",
    confidence: 50,
  },


];



function signalStyle(
  signal: MarketOpportunity["signal"]
){

  switch(signal){

    case "BUY":

      return "bg-emerald-500/20 text-emerald-400";


    case "SELL":

      return "bg-red-500/20 text-red-400";


    default:

      return "bg-slate-500/20 text-slate-400";

  }

}





export default function Scanner(){


  return (


    <section className="card">


      {/* Header */}

      <div className="flex justify-between items-center mb-6">


        <div>


          <h2 className="text-xl font-semibold">

            Market Scanner

          </h2>


          <p className="text-sm text-slate-400">

            Multi pair opportunity detection

          </p>


        </div>



        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-400">

          LIVE READY

        </span>


      </div>





      {/* Table */}


      <div className="overflow-x-auto">


        <table className="w-full">


          <thead>

            <tr className="border-b border-white/10 text-sm text-slate-400">


              <th className="text-left py-3">

                Pair

              </th>


              <th className="text-left">

                Price

              </th>


              <th className="text-left">

                RSI

              </th>


              <th className="text-left">

                Signal

              </th>


              <th className="text-left">

                Confidence

              </th>


            </tr>


          </thead>




          <tbody>


            {markets.map((market)=>(


              <tr

                key={market.pair}

                className="border-b border-white/5"


              >


                <td className="py-4 font-semibold">

                  {market.pair}

                </td>



                <td>

                  Rp {market.price.toLocaleString("id-ID")}

                </td>



                <td>

                  {market.rsi}

                </td>



                <td>


                  <span

                    className={`rounded-full px-3 py-1 text-xs font-semibold ${signalStyle(market.signal)}`}

                  >

                    {market.signal}

                  </span>


                </td>




                <td>


                  {market.confidence}%

                  
                </td>


              </tr>


            ))}



          </tbody>


        </table>


      </div>



    </section>


  );


}
