import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';

interface MarketPair {
  id: string;
  symbol: string;
  lastPrice: number;
  high: number;
  low: number;
  volIdr: number;
}

export default function MarketOverviewPage() {
  const [markets, setMarkets] = useState<MarketPair[]>([]);
  const [loading, setLoading] = useState(true);

  const watchPairs = ['btc_idr', 'eth_idr', 'sol_idr', 'sgb_idr'];

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const results = await Promise.all(
          watchPairs.map(async (pair) => {
            const res = await fetch(`https://indodax.com/api/${pair}/ticker`);
            const data = await res.json();
            return {
              id: pair,
              symbol: pair.replace('_idr', '').toUpperCase(),
              lastPrice: parseFloat(data.ticker.last),
              high: parseFloat(data.ticker.high),
              low: parseFloat(data.ticker.low),
              volIdr: parseFloat(data.ticker.vol_idr),
            };
          })
        );
        setMarkets(results);
      } catch (error) {
        console.error('Failed to fetch market list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000); // Auto-refresh tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <Head>
        <title>Market Overview | AutoIDX Engine</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Indodax Market Scanner</h1>
          <p className="text-xs text-gray-400 mt-1">
            Pantau pergerakan harga dan volume transaksi langsung dari Indodax Public API.
          </p>
        </div>

        {/* Market Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-gray-400 uppercase font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="p-4">Asset Pair</th>
                  <th className="p-4">Last Price</th>
                  <th className="p-4">24h High</th>
                  <th className="p-4">24h Low</th>
                  <th className="p-4">Volume (IDR)</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-gray-300 font-mono">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4 bg-slate-800/20" colSpan={6}>
                          Loading market data...
                        </td>
                      </tr>
                    ))
                  : markets.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-bold text-white flex items-center space-x-2">
                          <span>{m.symbol}/IDR</span>
                        </td>
                        <td className="p-4 text-emerald-400 font-semibold">
                          Rp {m.lastPrice.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-slate-300">
                          Rp {m.high.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-slate-300">
                          Rp {m.low.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-slate-400">
                          Rp {Math.round(m.volIdr).toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/market/${m.id}`}
                            className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded-lg text-[11px] font-sans font-medium transition"
                          >
                            Detail Depth ➔
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
