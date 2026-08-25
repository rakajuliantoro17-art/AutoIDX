/**
==========================================================
AURA Trade OS
Strategy Control
Version : 0.1.0 Alpha

Enable/disable strategi individual tanpa redeploy. Mengaktifkan
services/strategy/registry.ts (sebelumnya orphan total, in-memory)
lewat persistensi Firestore (registryStore.ts).

Kalau strategi yang sedang jadi default sesuai mode (Settings ->
Strategy) di-disable, bot fallback ke AURA_TREND. Kalau AURA_TREND
sendiri di-disable, bot HOLD total sampai diaktifkan lagi.
==========================================================
*/
"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/services/auth/AuthContext";

interface StrategyStatus {
  name: string;
  status: "ACTIVE" | "DISABLED";
}

const STRATEGY_DESCRIPTIONS: Record<string, string> = {
  AURA_TREND: "Hybrid EMA+MACD+ADX+RSI - dipakai mode BALANCED, dan jadi fallback aman kalau strategi lain di-disable.",
  EMA_CROSSOVER: "EMA trend following sederhana - dipakai mode CONSERVATIVE.",
  MOMENTUM: "RSI+Stochastic+MACD momentum - dipakai mode AGGRESSIVE.",
};

export default function StrategyControlPage() {
  const { user, loading: authLoading } = useAuth();

  const [strategies, setStrategies] = useState<StrategyStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/strategy/status", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setStrategies(data.strategies);
      }
    } catch (err: any) {
      setError(err?.message ?? "Gagal memuat status strategi");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleToggle(name: string, currentStatus: "ACTIVE" | "DISABLED") {
    if (!user) return;

    const nextStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";

    if (
      nextStatus === "DISABLED" &&
      !confirm(`Nonaktifkan ${name}? Kalau ini strategi default mode aktif, bot akan fallback ke AURA_TREND.`)
    ) {
      return;
    }

    setToggling(name);
    setMessage(null);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/strategy/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name, status: nextStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setMessage(data.message);
        await fetchStatus();
      }
    } catch (err: any) {
      setError(err?.message ?? "Gagal toggle strategi");
    } finally {
      setToggling(null);
    }
  }

  if (authLoading) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">Memuat...</p>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <p className="text-slate-400">Silakan login dulu.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Strategy Control</h1>
          <p className="text-sm text-slate-400 mt-1">
            Berlaku mulai siklus cron berikutnya (di-refresh sekali per
            siklus, bukan real-time). Nonaktifkan strategi default mode
            aktif → bot fallback ke AURA_TREND. Nonaktifkan AURA_TREND
            juga → bot HOLD total.
          </p>
        </div>

        {error && (
          <div className="rounded bg-red-950 border border-red-800 p-3 text-sm text-red-300">
            Gagal: {error}
          </div>
        )}

        {message && (
          <div className="rounded bg-emerald-950 border border-emerald-800 p-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        <div className="space-y-3">
          {strategies.map((s) => (
            <div key={s.name} className="card flex items-center justify-between">
              <div>
                <p className="font-bold">{s.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {STRATEGY_DESCRIPTIONS[s.name] ?? ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    s.status === "ACTIVE"
                      ? "bg-emerald-950 text-emerald-300"
                      : "bg-red-950 text-red-300"
                  }`}
                >
                  {s.status}
                </span>
                <button
                  onClick={() => handleToggle(s.name, s.status)}
                  disabled={toggling === s.name || loading}
                  className="rounded bg-slate-700 px-3 py-2 text-sm disabled:opacity-50"
                >
                  {toggling === s.name
                    ? "..."
                    : s.status === "ACTIVE"
                    ? "Nonaktifkan"
                    : "Aktifkan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
