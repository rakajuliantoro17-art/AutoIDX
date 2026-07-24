import Head from 'next/head';
import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function SettingsPage() {
  // Local state untuk menyimpan konfigurasi sementara
  const [tradingPair, setTradingPair] = useState('btc_idr');
  const [tradeAmount, setTradeAmount] = useState('50000');
  const [stopLoss, setStopLoss] = useState('2.0');
  const [takeProfit, setTakeProfit] = useState('4.0');
  const [rsiOversold, setRsiOversold] = useState('30');
  const [rsiOverbought, setRsiOverbought] = useState('70');
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Pengaturan Bot | AutoIDX Engine</title>
      </Head>

      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Bot Engine Settings</h1>
          <p className="text-xs text-gray-400 mt-1">
            Konfigurasi parameter trading, toleransi risiko, dan indikator teknikal AutoIDX.
          </p>
        </div>

        {/* Status Notification */}
        {savedStatus && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>✅ Konfigurasi berhasil disimpan!</span>
            <span className="text-[10px] text-emerald-300">Updated</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Trading & Pair Configuration */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <span>⚙️</span>
              <span>Pasar & Nominal Perdagangan</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-2">
                  Trading Pair Active
                </label>
                <select
                  value={tradingPair}
                  onChange={(e) => setTradingPair(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="btc_idr">BTC / IDR (Bitcoin)</option>
                  <option value="eth_idr">ETH / IDR (Ethereum)</option>
                  <option value="sol_idr">SOL / IDR (Solana)</option>
                  <option value="sgb_idr">SGB / IDR (Songbird)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-2">
                  Nominal Beli Per Order (IDR)
                </label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 font-mono transition"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Risk Management */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <span>🛡️</span>
              <span>Manajemen Risiko (Risk Management)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-2">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-rose-400 font-mono focus:outline-none focus:border-rose-500 transition"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Batas toleransi penurunan harga sebelum otomatis eksekusi jual.
                </p>
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-2">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-emerald-400 font-mono focus:outline-none focus:border-emerald-500 transition"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Target kenaikan harga untuk mengunci keuntungan.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Indicator Parameters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <span>📈</span>
              <span>Parameter Indikator Teknikal (RSI)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-2">
                  RSI Oversold Level (Sinyal BUY)
                </label>
                <input
                  type="number"
                  value={rsiOversold}
                  onChange={(e) => setRsiOversold(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-2">
                  RSI Overbought Level (Sinyal SELL)
                </label>
                <input
                  type="number"
                  value={rsiOverbought}
                  onChange={(e) => setRsiOverbought(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-950/40"
            >
              💾 Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}