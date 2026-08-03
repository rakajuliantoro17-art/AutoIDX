/**
==========================================================
AURA Trade OS
Backtesting Dashboard
Version : 0.0.1 Alpha
==========================================================
*/

import AppDashboardLayout from "@/layouts/AppDashboardLayout";

export default function BacktestPage() {

  const summary = {
    strategy: "EMA 9 / EMA 21 + RSI",
    period: "30 Days",
    initialCapital: 1000000,
    finalCapital: 1000000,
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    profit: 0,
  };

  return (

    <AppDashboardLayout>
    <section className="space-y-8">

      <div className="glass p-8">

        <h1 className="text-3xl font-bold">

          Strategy Backtesting

        </h1>

        <p className="mt-2 text-slate-400">

          Simulasi performa strategi sebelum digunakan
          pada mode Live Trading.

        </p>

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-4">

        <div className="card">

          <p className="text-sm text-slate-400">

            Strategy

          </p>

          <h2 className="mt-2 text-lg font-bold">

            {summary.strategy}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Testing Period

          </p>

          <h2 className="mt-2 text-lg font-bold">

            {summary.period}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Total Trades

          </p>

          <h2 className="mt-2 text-2xl font-bold">

            {summary.totalTrades}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Win Rate

          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-400">

            {summary.winRate}%

          </h2>

        </div>

      </div>

      {/* Capital */}

      <div className="grid gap-6 md:grid-cols-3">

        <div className="card">

          <p className="text-sm text-slate-400">

            Initial Capital

          </p>

          <h2 className="mt-2 text-xl font-bold">

            Rp {summary.initialCapital.toLocaleString("id-ID")}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Final Capital

          </p>

          <h2 className="mt-2 text-xl font-bold">

            Rp {summary.finalCapital.toLocaleString("id-ID")}

          </h2>

        </div>

        <div className="card">

          <p className="text-sm text-slate-400">

            Net Profit

          </p>

          <h2 className="mt-2 text-xl font-bold text-sky-400">

            Rp {summary.profit.toLocaleString("id-ID")}

          </h2>

        </div>

      </div>

      {/* Results */}

      <div className="card">

        <h2 className="text-xl font-semibold">

          Backtest Results

        </h2>

        <div className="mt-6 overflow-x-auto">

          <table className="w-full">

            <thead className="border-b border-white/10">

              <tr>

                <th className="py-3 text-left">

                  Date

                </th>

                <th className="text-left">

                  Pair

                </th>

                <th className="text-left">

                  Signal

                </th>

                <th className="text-left">

                  Entry

                </th>

                <th className="text-left">

                  Exit

                </th>

                <th className="text-left">

                  Profit

                </th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td
                  colSpan={6}
                  className="py-8 text-center text-slate-500"
                >

                  Belum ada hasil backtest.

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </section>

    </AppDashboardLayout>
  );

}
