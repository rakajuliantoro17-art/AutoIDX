import Head from 'next/head';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatusCard from '@/components/StatusCard';
import RiskBadge from '@/components/RiskBadge';
import PriceChart from '@/components/PriceChart';
import ActivityLogs from '@/components/ActivityLogs';

export default function DashboardPage() {
  const [data, setData] = useState({
    price: 0,
    rsi: 50,
    signal: 'HOLD',
    loading: true,
  });

  const [logs] = useState([
    { id: '1', timestamp: '16:00:00', message: 'Vercel Cron triggered successfully', type: 'info' as const },
    { id: '2', timestamp: '16:00:02', message: 'Indodax Ticker BTC/IDR fetched', type: 'success' as const },
    { id: '3', timestamp: '16:00:03', message: 'Signal: HOLD (RSI: 48.5 - EMA Crossover Neutral)', type: 'info' as const },
  ]);

  useEffect(() => {
    // Fetch data dari Indodax Public API
    const fetchMarket = async () => {
      try {
        const res = await fetch('https://indodax.com/api/btc_idr/ticker');
        const json = await res.json();
        setData({
          price: parseFloat(json.ticker.last),
          rsi: 48.5,
          signal: 'HOLD',
          loading: false,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchMarket();
  }, []);

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard | AutoIDX Engine</title>
      </Head>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Bot Executive Overview</h1>
            <p className="text-xs text-gray-400 mt-1">
              Pemantauan real-time status eksekusi bot Indodax via Serverless Cron.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <RiskBadge signal={data.signal} />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Harga Terakhir (BTC/IDR)"
            value={data.loading ? '...' : `Rp ${data.price.toLocaleString('id-ID')}`}
            subtext="Indodax Realtime Ticker"
            trend="up"
            loading={data.loading}
          />
          <StatusCard
            title="Relative Strength Index"
            value={data.loading ? '...' : data.rsi}
            subtext="Period: 14 | Oversold: <30"
            loading={data.loading}
          />
          <StatusCard
            title="Status Posisi"
            value="OUT OF POSITION"
            subtext="Ready for BUY Signal"
          />
          <StatusCard
            title="Stop Loss / Take Profit"
            value="2.0% / 4.0%"
            subtext="Dynamic Risk Management"
          />
        </div>

        {/* Charts & Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceChart pair="btc_idr" />
          </div>
          <div>
            <ActivityLogs logs={logs} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
