/**
==========================================================
AURA Trade OS
Market Pair Detail
Version : 0.0.1 Alpha
==========================================================
*/

import {
  useRouter
} from "next/router";

import {
  useEffect,
  useState
} from "react";

import DashboardLayout from "@/layouts/DashboardLayout";


interface DepthOrder {

  price: number;

  amount: number;

}



export default function MarketPairDetail() {


  const router = useRouter();


  const {
    pair
  } = router.query;



  const activePair =
    typeof pair === "string"
      ? pair
      : "btc_idr";



  const [bids, setBids] = useState<DepthOrder[]>([]);


  const [asks, setAsks] = useState<DepthOrder[]>([]);


  const [loading, setLoading] = useState(true);





  useEffect(() => {


    if (!router.isReady) {

      return;

    }



    async function loadDepth() {


      try {


        const response = await fetch(
          `/api/market/${activePair}/depth`
        );



        if (!response.ok) {

          throw new Error(
            "Failed fetching market depth"
          );

        }



        const data = await response.json();



        setBids(
          data.bids ?? []
        );



        setAsks(
          data.asks ?? []
        );



      } catch (error) {


        console.error(
          "Depth Error:",
          error
        );



        setBids([]);

        setAsks([]);



      } finally {


        setLoading(false);


      }


    }



    loadDepth();



  }, [
    router.isReady,
    activePair
  ]);






  return (

    <DashboardLayout>


      <div className="space-y-6">



        <div>


          <h1 className="text-2xl font-bold text-white">


            Market Depth:


            <span className="text-emerald-400 ml-2">


              {activePair.toUpperCase()}


            </span>


          </h1>



          <p className="text-sm text-slate-400 mt-2">


            Order book BUY dan SELL dari market Indodax.


          </p>


        </div>






        <div className="grid md:grid-cols-2 gap-6">



          <OrderBook

            title="BUY ORDERS"

            color="text-emerald-400"

            orders={bids}

            loading={loading}

          />




          <OrderBook

            title="SELL ORDERS"

            color="text-rose-400"

            orders={asks}

            loading={loading}

          />



        </div>




      </div>


    </DashboardLayout>

  );


}







function OrderBook({

  title,

  color,

  orders,

  loading

}: {


  title:string;


  color:string;


  orders:DepthOrder[];


  loading:boolean;


}) {



  return (


    <div className="glass p-5">



      <h2
        className={`font-bold ${color}`}
      >

        {title}


      </h2>




      <div className="mt-4 space-y-2 text-sm">



        {


          loading ? (


            <p className="text-slate-400">

              Loading order book...

            </p>


          ) : orders.length === 0 ? (


            <p className="text-slate-500">

              No order data available.

            </p>


          ) : (


            orders.map(
              (
                item,
                index
              ) => (


                <div

                  key={index}

                  className="flex justify-between"

                >



                  <span>


                    Rp{" "}

                    {item.price.toLocaleString(
                      "id-ID"
                    )}


                  </span>



                  <span className="text-slate-400">


                    {item.amount}


                  </span>



                </div>


              )

            )


          )


        }



      </div>



    </div>


  );


}
