/**
==========================================================
AURA Trade OS
Executive Dashboard
Version : 0.1.0 Alpha

Perubahan dari 0.0.2:
1. Sebelumnya fetch ke /api/market (MarketScanner - tujuan
   beda, cari peluang lintas-pair) dan membaca field
   (lastPrice/rsi/signal/inPosition) yang TIDAK ADA di response
   itu - selalu jatuh ke default (price selalu Rp 0). Sekarang
   fetch ke /api/bot/state (bot_state Firestore, sumber
   kebenaran status bot sebenarnya, di-update tiap siklus cron
   oleh services/trading/engine.ts, termasuk saat HOLD).
2. `logs` sebelumnya array statis hardcode 3 baris, tidak pernah
   berubah. Sekarang fetch dari /api/logs/recent (endpoint yang
   sama dipakai src/app/activity/page.tsx), auto-refresh.

CATATAN: bot_state tidak simpan RSI (dihitung ulang tiap siklus
dari candle, tidak disimpan) - RSI card dihapus dari tampilan
sementara sampai ada tempat penyimpanan snapshot RSI terakhir.
Menampilkan RSI palsu/statis lebih menyesatkan daripada tidak
menampilkannya sama sekali.
==========================================================
*/
"use client";

import { useEffect, useState, useCallback } from "react";
import { formatIDR } from "@/utils";
import { REFRESH_INTERVALS } from "@/utils/constants";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatusCard from "@/components/StatusCard";
import RiskBadge from "@/components/RiskBadge";
import PriceChart from "@/components/PriceChart";
import ActivityLogs from "@/components/ActivityLogs";
import { useAuth } from "@/services/auth/AuthContext";

interface DashboardData {
  price: number;
  signal: "BUY" | "SELL" | "HOLD";
  position: string;
  stopLoss: number;
  takeProfit: number;
  loading: boolean;
  error: string | null;
}

interface LogItem {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
}

const REFRESH_INTERVAL_MS = REFRESH_INTERVALS.STATUS_MS;

function formatClock(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("id-ID", { hour12: false });
}

export default function DashboardPage() {

  const { user } = useAuth();

  // Pair yang ditampilkan SEKARANG bisa dipilih -- sebelumnya
  // hardcode "btc_idr" padahal bot scan & bisa BUY pair manapun
  // (services/scanner/index.ts). Daftar pilihannya diambil dari
  // /api/bot/pairs (semua pair yang punya bot_state tersimpan).
  const [selectedPair, setSelectedPair] = useState("btc_idr");
  const [availablePairs, setAvailablePairs] = useState<string[]>(["btc_idr"]);

  const [data, setData] = useState<DashboardData>({
    price: 0,
    signal: "HOLD",
    position: "OUT OF POSITION",
    stopLoss: 1,
    takeProfit: 3,
    loading: true,
    error: null,
  });

  const [logs, setLogs] = useState<LogItem[]>([]);

  const loadAvailablePairs = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const res = await fetch("/api/bot/pairs", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) return;

      const json = await res.json();

      if (Array.isArray(json.pairs) && json.pairs.length > 0) {
        setAvailablePairs(json.pairs);
      }

    } catch (error) {
      console.error("[Dashboard] Failed to load available pairs:", error);
      // Diam-diam gagal - dropdown tetap bisa dipakai dengan
      // availablePairs default (["btc_idr"]), tidak menutupi
      // seluruh dashboard demi 1 dropdown gagal terisi.
    }

  }, [user]);

  const loadBotState = useCallback(async () => {

    if (!user) return;

    setData((prev) => ({ ...prev, loading: true }));

    try {

      const idToken = await user.getIdToken();

      const res = await fetch(`/api/bot/state?pair=${encodeURIComponent(selectedPair)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Bot State API failed: ${res.status}`);
      }

      const json = await res.json();

      setData({
        price: json.currentPrice ?? 0,
        signal: json.lastSignal ?? "HOLD",
        position: json.inPosition ? "ACTIVE POSITION" : "OUT OF POSITION",
        stopLoss: json.stopLoss ?? 1,
        takeProfit: json.takeProfit ?? 3,
        loading: false,
        error: null,
      });

    } catch (error) {

      console.error("[Dashboard] Failed to load bot state:", error);

      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Gagal memuat status bot",
      }));

    }

  }, [user, selectedPair]);

  const loadLogs = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const res = await fetch("/api/logs/recent?limit=10", {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!res.ok) return;

      const json = await res.json();

      setLogs(
        (json.logs ?? []).map((log: any) => ({
          id: log.id,
          timestamp: formatClock(log.timestamp),
          message: log.message,
          type:
            log.type === "success" || log.type === "warning" || log.type === "danger"
              ? log.type
              : "info",
        }))
      );

    } catch (error) {
      console.error("[Dashboard] Failed to load logs:", error);
    }

  }, [user]);

  useEffect(() => {

    loadAvailablePairs();

  }, [loadAvailablePairs]);

  useEffect(() => {

    loadBotState();
    loadLogs();

    const interval = setInterval(() => {
      loadBotState();
      loadLogs();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);

  }, [loadBotState, loadLogs]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Bot Executive Overview</h1>
            <p className="text-xs text-slate-400">Serverless Trading Monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-md text-xs px-3 py-2 text-slate-200"
              aria-label="Pilih pair yang ditampilkan"
            >
              {availablePairs.map((p) => (
                <option key={p} value={p}>
                  {p.replace("_", "/").toUpperCase()}
                </option>
              ))}
            </select>
            <RiskBadge signal={data.signal} />
          </div>
        </div>

        {/* Error banner (tampil kalau fetch gagal, tidak menutupi seluruh dashboard) */}
        {data.error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
            {data.error} — menampilkan nilai default sementara.
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatusCard
            title={`${selectedPair.replace("_", "/").toUpperCase()} Price`}
            value={data.loading ? "..." : formatIDR(data.price ?? 0)}
            subtext="bot_state (siklus terakhir)"
            loading={data.loading}
          />
          <StatusCard title="Position" value={data.position} />
          <StatusCard
            title="Risk"
            value={`${data.stopLoss}% / ${data.takeProfit}%`}
            subtext="SL / TP"
          />
        </div>

        {/* Main Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PriceChart pair={selectedPair} />
          </div>
          <ActivityLogs logs={logs} />
        </div>
      </div>
    </DashboardLayout>
  );
}
