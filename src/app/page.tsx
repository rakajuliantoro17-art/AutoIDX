'use client';

import { useState, useEffect } from 'react';

interface BotStatus {
  pair: string;
  lastPrice: number;
  rsi: number;
  signal: string;
  inPosition: boolean;
  status: string;
}

export default function Dashboard() {
  const [data, setData] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/bot');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to fetch bot data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 10000); // Refresh tiap 10 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Overview Engine</h2>
        <button
          onClick={fetchBotStatus}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Grid Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
          <p className="text-sm text-gray-400">Pair Active</p>
          <p className="text-xl font-semibold mt-1">{data?.pair || 'BTC/IDR'}</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
          <p className="text-sm text-gray-400">Last Price</p>
          <p className="text-xl font-semibold text-emerald-400 mt-1">
            {loading ? '...' : `Rp ${data?.lastPrice?.toLocaleString('id-ID') || '0'}`}
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
          <p className="text-sm text-gray-400">RSI Indicator</p>
          <p className="text-xl font-semibold mt-1">{loading ? '...' : data?.rsi || '50'}</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700 p-4 rounded-xl">
          <p className="text-sm text-gray-400">Signal Status</p>
          <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
            data?.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
            data?.signal === 'SELL' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
            'bg-gray-500/20 text-gray-400 border border-gray-500/40'
          }`}>
            {loading ? 'LOADING' : data?.signal || 'HOLD'}
          </span>
        </div>
      </div>

      {/* Activity Log Placeholder */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Aktivitas Terakhir</h3>
        <div className="space-y-3 font-mono text-sm">
          <div className="p-3 bg-slate-900/60 rounded-lg flex justify-between items-center text-gray-300">
            <span>[CRON] Bot execution trigger completed</span>
            <span className="text-xs text-gray-500">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
