/**
==========================================================
AURA Trade OS
Portfolio Page
Version : 0.0.1 Alpha
==========================================================
*/

import Link from "next/link";

export default function PortfolioPage() {

  // Dummy data v0.0.1
  const portfolio = {
    balance: 500000,
    invested: 25000,
    available: 475000,
    unrealizedPnL: 0,
    realizedPnL: 0,
    openPositions: 0,
    totalTrades: 0,
    winRate: 0,
  };

  return (
    <section className="space-y-8">

      <div className="glass p-8">

        <h1 className="text-3xl font-bold">
          Portfolio
        </h1>

        <p className="mt-2 text-slate-400">
          Ringkasan saldo dan performa trading AutoIDX.
        </p>

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-4">

        <div className="card">
          <p className="text-sm text-slate-400">
            Total Balance
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Rp {portfolio.balance.toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Available
          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-400">
            Rp {portfolio.available.toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Invested
          </p>

          <h2 className="mt-2 text-2xl font-bold text-sky-400">
            Rp {portfolio.invested.toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Open Positions
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {portfolio.openPositions}
          </h2>
        </div>

      </div>

      {/* Performance */}

      <div className="grid gap-6 md:grid-cols-3">

        <div className="card">
          <p className="text-sm text-slate-400">
            Realized Profit
          </p>

          <h2 className="mt-2 text-xl font-bold text-emerald-400">
            Rp {portfolio.realizedPnL.toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Unrealized Profit
          </p>

          <h2 className="mt-2 text-xl font-bold text-yellow-400">
            Rp {portfolio.unrealizedPnL.toLocaleString("id-ID")}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Win Rate
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {portfolio.winRate}%
          </h2>
        </div>

      </div>

      {/* Trade History */}

      <div className="card">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold">
            Recent Trades
          </h2>

          <Link
            href="/activity"
            className="text-sky-400 hover:underline"
          >
            View Activity →
          </Link>

        </div>

        <div className="mt-6 overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-white/10">

              <tr>

                <th className="py-3">Pair</th>

                <th>Status</th>

                <th>Buy</th>

                <th>Sell</th>

                <th>PnL</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td
                  colSpan={5}
                  className="py-8 text-center text-slate-500"
                >

                  Belum ada transaksi.

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );

}
