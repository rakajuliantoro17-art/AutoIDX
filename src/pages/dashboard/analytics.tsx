import Head from 'next/head';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <Head>
        <title>Analisa Teknikal | AutoIDX Engine</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Technical Analytics</h1>
          <p className="text-xs text-gray-400 mt-1">
            Visualisasi perhitungan indikator strategi EMA & RSI untuk pasangan BTC/IDR.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl">
            <p className="text-xs text-gray-400">EMA Fast (9)</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">1,045,200,000 IDR</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl">
            <p className="text-xs text-gray-400">EMA Slow (21)</p>
            <p className="text-xl font-bold text-slate-300 mt-1">1,042,100,000 IDR</p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/60 p-5 rounded-2xl">
            <p className="text-xs text-gray-400">Trend Condition</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">BULLISH CROSSOVER</p>
          </div>
        </div>

        <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center">
          <p className="text-gray-400 text-sm">
            📊 Modul visualisasi grafik indikator teknikal tingkat lanjut sedang aktif.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
