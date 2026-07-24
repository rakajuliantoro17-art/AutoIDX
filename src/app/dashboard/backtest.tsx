/**
==========================================================
AURA Trade OS
Dashboard Backtest Widget
Version : 0.0.1 Alpha
==========================================================
*/

interface BacktestSummary {
  strategy: string;
  period: string;
  trades: number;
  winRate: number;
  profit: number;
}

const summary: BacktestSummary = {
  strategy: "EMA 9 / EMA 21 + RSI",
  period: "30 Days",
  trades: 0,
  winRate: 0,
  profit: 0,
};

export default function Backtest() {

  return (

    <section className="card">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-semibold">

            Backtesting

          </h2>

          <p className="text-sm text-slate-400">

            Latest strategy simulation

          </p>

        </div>

        <span className="rounded-full bg-sky-500/20 px-3 py-1 text-xs text-sky-400">

          {summary.period}

        </span>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div>

          <p className="text-xs text-slate-500">

            Strategy

          </p>

          <p className="font-semibold mt-1">

            {summary.strategy}

          </p>

        </div>

        <div>

          <p className="text-xs text-slate-500">

            Trades

          </p>

          <p className="font-semibold mt-1">

            {summary.trades}

          </p>

        </div>

        <div>

          <p className="text-xs text-slate-500">

            Win Rate

          </p>

          <p className="font-semibold text-emerald-400 mt-1">

            {summary.winRate}%

          </p>

        </div>

        <div>

          <p className="text-xs text-slate-500">

            Net Profit

          </p>

          <p className="font-semibold text-sky-400 mt-1">

            Rp {summary.profit.toLocaleString("id-ID")}

          </p>

        </div>

      </div>

      <div className="mt-6 rounded-xl border border-dashed border-white/10 p-4">

        <p className="text-sm text-slate-400">

          Belum ada hasil backtest yang dijalankan.

        </p>

      </div>

    </section>

  );

}
