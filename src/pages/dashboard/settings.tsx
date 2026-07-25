/**
==========================================================
AURA Trade OS
Settings Control Panel
Version : 0.0.1 Alpha
==========================================================
*/
import DashboardLayout from "@/layouts/DashboardLayout";

interface TradingConfig {
  mode: string;
  tradeAmount: number;
  targetProfit: number;
  stopLoss: number;
  maxPosition: number;
  confidence: number;
  pairs: string[];
}

const config: TradingConfig = {
  mode: "PAPER",
  tradeAmount: 25000,
  targetProfit: 3,
  stopLoss: 2,
  maxPosition: 3,
  confidence: 75,
  pairs: ["BTC/IDR", "ETH/IDR", "SOL/IDR"],
};

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <section className="space-y-8">
        <div className="glass p-8">
          <h1 className="text-3xl font-bold">AURA Trade OS Settings</h1>
          <p className="text-slate-400 mt-2">Trading configuration and risk management</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-5">Trading Mode</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-sm text-slate-400">Current Mode</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{config.mode}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Exchange</p>
              <p className="text-3xl font-bold text-sky-400 mt-2">Indodax</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Risk Management</h2>
          <div className="grid md:grid-cols-4 gap-5">
            <div>
              <p className="text-xs text-slate-500">Trade Amount</p>
              <p className="font-bold mt-2">Rp {config.tradeAmount.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Target Profit</p>
              <p className="font-bold text-emerald-400 mt-2">{config.targetProfit}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Stop Loss</p>
              <p className="font-bold text-red-400 mt-2">{config.stopLoss}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Max Position</p>
              <p className="font-bold mt-2">{config.maxPosition}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold">AI Confidence Threshold</h2>
          <p className="text-slate-400 mt-2">Minimum confidence sebelum bot melakukan transaksi.</p>
          <div className="mt-5">
            <div className="flex justify-between">
              <span>Confidence</span>
              <span className="text-sky-400 font-bold">{config.confidence}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-sky-500" style={{ width: `${config.confidence}%` }} />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-5">Allowed Trading Pair</h2>
          <div className="flex flex-wrap gap-3">
            {config.pairs.map((pair) => (
              <span key={pair} className="rounded-full bg-white/10 px-4 py-2 text-sm">
                {pair}
              </span>
            ))}
          </div>
        </div>

        <div className="card border border-dashed border-white/10">
          <h2 className="text-xl font-semibold">Future Configuration</h2>
          <ul className="mt-4 text-slate-400 space-y-2">
            <li>• Firebase remote configuration</li>
            <li>• Telegram notification</li>
            <li>• AI risk adjustment</li>
            <li>• Live trading switch protection</li>
          </ul>
        </div>
      </section>
    </DashboardLayout>
  );
}
