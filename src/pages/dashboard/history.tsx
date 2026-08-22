/**
==========================================================
AURA Trade OS
Transaction History
Version : 0.2.0

Perubahan dari 0.0.1: sebelumnya halaman ini SELALU menampilkan
2 baris dummy hardcode (ORD-9821/ORD-9822, badge Mode selalu
"PAPER") -- TIDAK PERNAH membaca data asli. Sekarang fetch dari
/api/trades/history yang membaca koleksi "trades" (live) atau
"paper_trade_logs" (paper) sesuai mode bot yang SEDANG aktif.
==========================================================
*/

"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/services/auth/AuthContext";

interface OrderHistoryRow {
  id: string;
  type: "BUY" | "SELL";
  pair: string;
  price: number;
  amount: number;
  totalIdr: number;
  profitIdr: number | null;
  timestampMs: number;
  status: "FILLED";
}

const REFRESH_INTERVAL_MS = 10000;

function formatIdr(value: number): string {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function formatAmount(value: number, pair: string): string {
  const base = pair.split("_")[0] ?? "";
  return `${value.toFixed(8)} ${base}`;
}

function formatTimestamp(ms: number): string {
  if (!ms) return "-";
  return new Date(ms).toLocaleString("id-ID");
}

export default function HistoryPage() {

  const { user } = useAuth();

  const [orders, setOrders] = useState<OrderHistoryRow[]>([]);
  const [mode, setMode] = useState<"paper" | "live">("paper");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const response = await fetch("/api/trades/history", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil riwayat (${response.status})`);
      }

      const data = await response.json();

      setOrders(data.orders ?? []);
      setMode(data.mode ?? "paper");
      setError(null);

    } catch (err) {

      console.error("[HistoryPage] fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Gagal mengambil riwayat transaksi."
      );

    } finally {

      setLoading(false);

    }

  }, [user]);

  useEffect(() => {

    fetchHistory();

    const interval = setInterval(fetchHistory, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);

  }, [fetchHistory]);

  const buyCount = orders.filter((o) => o.type === "BUY").length;
  const sellCount = orders.filter((o) => o.type === "SELL").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Riwayat eksekusi order AutoIDX Engine
          </p>
        </div>

        {error && (
          <div className="card border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-4">
            {error}
          </div>
        )}

        {/* Summary */}
        <div className="grid md:grid-cols-4 gap-5">

          <div className="card">
            <p className="text-xs text-slate-400">Total Orders</p>
            <p className="text-2xl font-bold mt-2">{orders.length}</p>
          </div>

          <div className="card">
            <p className="text-xs text-slate-400">BUY Orders</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{buyCount}</p>
          </div>

          <div className="card">
            <p className="text-xs text-slate-400">SELL Orders</p>
            <p className="text-2xl font-bold text-rose-400 mt-2">{sellCount}</p>
          </div>

          <div className="card">
            <p className="text-xs text-slate-400">Mode</p>
            <p
              className={`text-xl font-bold mt-2 ${
                mode === "live" ? "text-amber-400" : "text-sky-400"
              }`}
            >
              {mode.toUpperCase()}
            </p>
          </div>

        </div>

        {/* Table */}
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4">TYPE</th>
                  <th className="p-4">PAIR</th>
                  <th className="p-4">PRICE</th>
                  <th className="p-4">AMOUNT</th>
                  <th className="p-4">TOTAL</th>
                  <th className="p-4">PROFIT</th>
                  <th className="p-4">STATUS</th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      Memuat riwayat transaksi...
                    </td>
                  </tr>
                )}

                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}

                {!loading &&
                  orders.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="p-4 text-slate-400">{tx.id}</td>

                      <td className="p-4">
                        <span
                          className={
                            tx.type === "BUY" ? "text-emerald-400" : "text-rose-400"
                          }
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="p-4">{tx.pair}</td>
                      <td className="p-4">{formatIdr(tx.price)}</td>
                      <td className="p-4">{formatAmount(tx.amount, tx.pair)}</td>
                      <td className="p-4">{formatIdr(tx.totalIdr)}</td>

                      <td
                        className={`p-4 ${
                          tx.profitIdr === null
                            ? "text-slate-400"
                            : tx.profitIdr >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {tx.profitIdr === null
                          ? "-"
                          : `${tx.profitIdr >= 0 ? "+" : ""}${formatIdr(tx.profitIdr)}`}
                      </td>

                      <td className="p-4">
                        <span className="text-emerald-400">● {tx.status}</span>
                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );

}
