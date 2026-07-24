import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';

interface DepthOrder {
  price: number;
  amount: number;
}

export default function MarketPairDetail() {
  const router = Router();
  const { pair } = router.query;

  const [bids, setBids] = useState<DepthOrder[]>([]);
  const [asks, setAsks] = useState<DepthOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const activePair = (pair as string) || 'btc_idr';

  useEffect(() => {
    if (!pair) return;

    const fetchDepth = async () => {
      try {
        const res = await fetch(`https://indodax.com/api/${activePair}/depth`);
        const data = await res.json();

        // Slice 10 antrean order beli dan jual teratas
        const parsedBids = (data.buy || []).slice(0, 10).map((b: [string, string]) => ({
          price: parseFloat(b[0]),
          amount: parseFloat(b[1]),
        }));

        const parsedAsks = (data.sell || []).slice(0, 10).map((s: [string, string]) => ({
          price: parseFloat(s[0]),
          amount: parseFloat(s[1]),
        }));

        setBids(parsedBids);
        setAsks(parsedAsks);
      } catch (err) {
        console.error('Failed to fetch depth data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepth();
  }, [pair, activePair]);

  return (
    <DashboardLayout>
      <Head>
        <title>{activePair.toUpperCase()} Depth | AutoIDX Engine</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Market Depth: <span className="text-emerald-400">{activePair.toUpperCase()}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Antrean Order Book (Buy & Sell) langsung dari papan perdagangan Indodax.
          </p>
        </div>

        {/* Order Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Bids Table (Beli) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-emerald-400 font-sans font-semibold text-sm mb-3">
              🟢 Buy Orders (Bids)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-500 border-b border-slate-800 pb-2">
                <span>Harga (IDR)</span>
                <span>Jumlah Koin</span>
              </div>
              {loading ? (
                <p className="text-gray-500 py-4">Loading bids...</p>
              ) : (
                bids.map((bid, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span className="text-emerald-400">Rp {bid.price.toLocaleString('id-ID')}</span>
                    <span>{bid.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Asks Table (Jual) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-rose-400 font-sans font-semibold text-sm mb-3">
              🔴 Sell Orders (Asks)
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-500 border-b border-slate-800 pb-2">
                <span>Harga (IDR)</span>
                <span>Jumlah Koin</span>
              </div>
              {loading ? (
                <p className="text-gray-500 py-4">Loading asks...</p>
              ) : (
                asks.map((ask, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span className="text-rose-400">Rp {ask.price.toLocaleString('id-ID')}</span>
                    <span>{ask.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}