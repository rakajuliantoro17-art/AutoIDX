/**
==========================================================
AURA Trade OS
Backtesting Dashboard
Version : 0.2.0 Alpha

Perubahan dari 0.1.0: sebelumnya seluruh halaman ini statis
(summary hardcode, tidak ada cara menjalankan backtest sama
sekali - tidak ada tombol run). Sekarang berbentuk form
(pair/timeframe/periode/strategi) yang memanggil
/api/backtest/run, mengambil candle historis asli dari
Indodax, dan menampilkan hasil simulasi sesungguhnya.
==========================================================
*/
"use client";

import { useState } from "react";

interface BacktestReport {
  title: string;
  strategy: string;
  pair: string;
  summary: {
    initialCapital: number;
    finalCapital: number;
    profitLoss: number;
    returnPercent: number;
  };
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfit: number;
    totalReturn: number;
    maxDrawdown: number;
    profitFactor: number;
    sharpeRatio: number;
  };
  trading: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    averageTrade: number;
  };
  risk: {
    maxDrawdown: number;
    sharpeRatio: number;
    riskLevel: string;
  };
  equityCurve: { timestamp: number; equity: number }[];
  generatedAt: number;
}

interface BacktestTradeRow {
  id: string;
  pair: string;
  entryPrice: number;
  exitPrice: number;
  profitLoss: number;
  openedAt: number;
  closedAt: number;
}

interface RunResponse {
  report: BacktestReport;
  candleCount: number;
  durationMs: number;
  trades?: BacktestTradeRow[];
}

const PAIR_OPTIONS = ["btc_idr", "eth_idr", "sol_idr"];
const TIMEFRAME_OPTIONS = [
  { value: "1h", label: "1 Jam" },
  { value: "4h", label: "4 Jam" },
  { value: "1d", label: "1 Hari" },
];
const STRATEGY_OPTIONS = [
  { value: "EMA_CROSSOVER", label: "EMA 9 / EMA 21 Crossover" },
  { value: "AURA_TREND", label: "AURA Trend (EMA + MACD + ADX + RSI)" },
];

function formatIdr(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function formatDate(ts: number): string {
  if (!ts) return "-";
  const date = ts > 10_000_000_000 ? new Date(ts) : new Date(ts * 1000);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BacktestPage() {
  const [pair, setPair] = useState(PAIR_OPTIONS[0]);
  const [timeframe, setTimeframe] = useState(TIMEFRAME_OPTIONS[0].value);
  const [days, setDays] = useState(30);
  const [strategy, setStrategy] = useState(STRATEGY_OPTIONS[0].value);
  const [initialCapital, setInitialCapital] = useState(1000000);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RunResponse | null>(null);

  async function runBacktest() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/backtest/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair,
          timeframe,
          days,
          strategy,
          initialCapital,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.error ?? "Gagal menjalankan backtest.");
      }

      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menjalankan backtest."
      );
    } finally {
      setLoading(false);
    }
  }

  const report = data?.report;

  return (
    <section className="space-y-8">
      <div className="glass p-8">
        <h1 className="text-3xl font-bold">Strategy Backtesting</h1>
        <p className="mt-2 text-slate-400">
          Simulasi performa strategi sebelum digunakan pada mode Live
          Trading.
        </p>
      </div>

      {/* Run Form */}
      <div className="card">
        <h2 className="text-xl font-semibold">Konfigurasi Backtest</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          <div>
            <label className="text-sm text-slate-400">Pair</label>
            <select
              className="mt-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              disabled={loading}
            >
              {PAIR_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p.replace("_", "/").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400">Timeframe</label>
            <select
              className="mt-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              disabled={loading}
            >
              {TIMEFRAME_OPTIONS.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400">Periode (hari)</label>
            <input
              type="number"
              min={1}
              max={90}
              className="mt-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Strategy</label>
            <select
              className="mt-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              disabled={loading}
            >
              {STRATEGY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-400">Modal Awal (Rp)</label>
            <input
              type="number"
              min={100000}
              step={100000}
              className="mt-2 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={loading}
          className="mt-6 rounded-lg bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Menjalankan Backtest..." : "Run Backtest"}
        </button>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-400">Strategy</p>
          <h2 className="mt-2 text-lg font-bold">
            {report
              ? STRATEGY_OPTIONS.find((s) => s.value === report.strategy)
                  ?.label ?? report.strategy
              : "-"}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Testing Period</p>
          <h2 className="mt-2 text-lg font-bold">
            {data ? `${days} Hari` : "-"}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Total Trades</p>
          <h2 className="mt-2 text-2xl font-bold">
            {report?.performance.totalTrades ?? 0}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Win Rate</p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-400">
            {report?.performance.winRate ?? 0}%
          </h2>
        </div>
      </div>

      {/* Capital */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-400">Initial Capital</p>
          <h2 className="mt-2 text-xl font-bold">
            {formatIdr(report?.summary.initialCapital ?? initialCapital)}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Final Capital</p>
          <h2 className="mt-2 text-xl font-bold">
            {formatIdr(report?.summary.finalCapital ?? initialCapital)}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Net Profit</p>
          <h2
            className={`mt-2 text-xl font-bold ${
              (report?.summary.profitLoss ?? 0) >= 0
                ? "text-sky-400"
                : "text-red-400"
            }`}
          >
            {formatIdr(report?.summary.profitLoss ?? 0)}
          </h2>
        </div>
      </div>

      {/* Extra Metrics */}
      {report && (
        <div className="grid gap-6 md:grid-cols-4">
          <div className="card">
            <p className="text-sm text-slate-400">Max Drawdown</p>
            <h2 className="mt-2 text-lg font-bold text-red-400">
              {report.risk.maxDrawdown}%
            </h2>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400">Profit Factor</p>
            <h2 className="mt-2 text-lg font-bold">
              {report.performance.profitFactor}
            </h2>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400">Sharpe Ratio</p>
            <h2 className="mt-2 text-lg font-bold">
              {report.risk.sharpeRatio}
            </h2>
          </div>
          <div className="card">
            <p className="text-sm text-slate-400">Risk Level</p>
            <h2 className="mt-2 text-lg font-bold">{report.risk.riskLevel}</h2>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="card">
        <h2 className="text-xl font-semibold">Backtest Results</h2>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="py-3 text-left">Date</th>
                <th className="text-left">Pair</th>
                <th className="text-left">Entry</th>
                <th className="text-left">Exit</th>
                <th className="text-left">Profit</th>
              </tr>
            </thead>
            <tbody>
              {!report || report.performance.totalTrades === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    {loading
                      ? "Menjalankan simulasi..."
                      : "Belum ada hasil backtest."}
                  </td>
                </tr>
              ) : (
                data?.trades?.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5">
                    <td className="py-3">{formatDate(trade.closedAt)}</td>
                    <td>{trade.pair.replace("_", "/").toUpperCase()}</td>
                    <td>{formatIdr(trade.entryPrice)}</td>
                    <td>{formatIdr(trade.exitPrice)}</td>
                    <td
                      className={
                        trade.profitLoss >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {formatIdr(trade.profitLoss)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
