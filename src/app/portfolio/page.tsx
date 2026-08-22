/**
==========================================================
AURA Trade OS
Portfolio Page
Version : 0.1.1 Alpha

Perubahan dari 0.1.0: banner peringatan "saldo BELUM menarik
dari akun Indodax" sudah tidak akurat -- /api/portfolio/summary
sekarang benar-benar menarik saldo live dari IndodaxClient.getInfo()
saat mode live aktif (lihat catatan di summary.ts). Banner diganti
jadi kondisional: hijau kalau saldo live berhasil ditarik, merah
dengan pesan error spesifik kalau gagal (mis. kredensial salah) --
supaya pengguna tidak salah kira angka Rp 0 adalah saldo sungguhan.
==========================================================
*/
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/services/auth/AuthContext";
import { formatIDR, formatPercent } from "@/utils";

interface TradeRow {
  pair: string;
  status: "OPEN" | "CLOSED";
  buyPrice: number;
  sellPrice: number | null;
  pnlIdr: number;
  pnlPercent: number;
}

interface PortfolioSummary {
  mode: "paper" | "live";
  balance: number;
  available: number;
  invested: number;
  openPositionsCount: number;
  realizedPnl: number;
  unrealizedPnl: number;
  winRate: number;
  totalClosedTrades: number;
  recentTrades: TradeRow[];
  liveBalanceError?: string;
}

const REFRESH_INTERVAL_MS = 5000;

const EMPTY_SUMMARY: PortfolioSummary = {
  mode: "paper",
  balance: 0,
  available: 0,
  invested: 0,
  openPositionsCount: 0,
  realizedPnl: 0,
  unrealizedPnl: 0,
  winRate: 0,
  totalClosedTrades: 0,
  recentTrades: [],
};

function formatIdr(value: number): string {
  return formatIDR(value, false);
}

function pnlColor(value: number): string {
  if (value > 0) return "text-emerald-400";
  if (value < 0) return "text-red-400";
  return "text-slate-300";
}

export default function PortfolioPage() {

  const { user } = useAuth();

  const [portfolio, setPortfolio] = useState<PortfolioSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const response = await fetch("/api/portfolio/summary", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Gagal memuat portfolio.");
      }

      setPortfolio(json);
      setLastFetchedAt(new Date().toLocaleTimeString("id-ID"));
      setError(null);

    } catch (err) {

      console.error("[PortfolioPage] Failed to fetch summary:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat portfolio."
      );

    } finally {
      setLoading(false);
    }

  }, [user]);

  useEffect(() => {

    fetchPortfolio();

    const interval = setInterval(fetchPortfolio, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);

  }, [fetchPortfolio]);

  return (
    <section className="space-y-8">

      <div className="glass p-8">

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              Portfolio
            </h1>

            <p className="mt-2 text-slate-400">
              Ringkasan saldo dan performa trading AutoIDX
              {" "}
              ({portfolio.mode === "live" ? "Live Trading" : "Paper Trading"})
              {" "}
              — auto-refresh tiap {REFRESH_INTERVAL_MS / 1000} detik.
            </p>

          </div>

          <div className="text-right text-xs text-slate-500">
            {lastFetchedAt ? `Update terakhir: ${lastFetchedAt}` : loading ? "Memuat..." : ""}
          </div>

        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        {portfolio.mode === "live" && !portfolio.liveBalanceError && (
          <p className="mt-4 text-sm text-emerald-400">
            Mode LIVE aktif -- saldo Available di bawah ditarik langsung
            dari akun Indodax secara real-time.
          </p>
        )}

        {portfolio.mode === "live" && portfolio.liveBalanceError && (
          <p className="mt-4 text-sm text-red-400">
            Mode LIVE aktif, tapi saldo asli Indodax gagal diambil:{" "}
            {portfolio.liveBalanceError}. Angka Available di bawah ini
            TIDAK akurat -- cek kredensial akun Indodax di halaman
            Settings.
          </p>
        )}

      </div>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-4">

        <div className="card">
          <p className="text-sm text-slate-400">
            Total Balance
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Rp {formatIdr(portfolio.balance)}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Available
          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-400">
            Rp {formatIdr(portfolio.available)}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Invested
          </p>

          <h2 className="mt-2 text-2xl font-bold text-sky-400">
            Rp {formatIdr(portfolio.invested)}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Open Positions
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {portfolio.openPositionsCount}
          </h2>
        </div>

      </div>

      {/* Performance */}

      <div className="grid gap-6 md:grid-cols-3">

        <div className="card">
          <p className="text-sm text-slate-400">
            Realized Profit
          </p>

          <h2 className={`mt-2 text-xl font-bold ${pnlColor(portfolio.realizedPnl)}`}>
            Rp {formatIdr(portfolio.realizedPnl)}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Unrealized Profit
          </p>

          <h2 className={`mt-2 text-xl font-bold ${pnlColor(portfolio.unrealizedPnl)}`}>
            Rp {formatIdr(portfolio.unrealizedPnl)}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">
            Win Rate
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {portfolio.winRate}%
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({portfolio.totalClosedTrades} trade selesai)
            </span>
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

              {portfolio.recentTrades.length === 0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
                    Belum ada transaksi.
                  </td>
                </tr>

              ) : (

                portfolio.recentTrades.map((trade, index) => (

                  <tr
                    key={`${trade.pair}-${index}`}
                    className="border-b border-white/5"
                  >

                    <td className="py-3 uppercase">
                      {trade.pair}
                    </td>

                    <td>
                      <span
                        className={
                          trade.status === "OPEN"
                            ? "rounded bg-sky-500/20 px-2 py-1 text-xs text-sky-400"
                            : "rounded bg-slate-500/20 px-2 py-1 text-xs text-slate-300"
                        }
                      >
                        {trade.status === "OPEN" ? "TERBUKA" : "SELESAI"}
                      </span>
                    </td>

                    <td>
                      Rp {formatIdr(trade.buyPrice)}
                    </td>

                    <td>
                      {trade.sellPrice !== null
                        ? `Rp ${formatIdr(trade.sellPrice)}`
                        : "-"}
                    </td>

                    <td className={pnlColor(trade.pnlIdr)}>
                      {trade.status === "OPEN"
                        ? "-"
                        : `Rp ${formatIdr(trade.pnlIdr)} (${formatPercent(trade.pnlPercent)})`}
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
