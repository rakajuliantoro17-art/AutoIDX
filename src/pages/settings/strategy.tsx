/**
==========================================================
AURA Trade OS
Strategy Settings
Version : 0.1.0 Alpha

SEBELUMNYA halaman ini stub kosong (<select> tanpa onChange,
tidak tersambung apa pun). Sekarang jadi editor sungguhan
untuk BotSettings.strategyMode -- field baru (lihat
api/settings/types.ts) yang dibaca services/trading/
effectiveConfig.ts lalu dipakai strategyManager.setMode()
di trading/engine.ts sebelum setiap evaluasi sinyal.

CONSERVATIVE -> strategi EMA_CROSSOVER
BALANCED (default) -> strategi AURA_TREND
AGGRESSIVE -> strategi MOMENTUM
(lihat services/strategy/manager.ts, getStrategyName())
==========================================================
*/

import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";

type StrategyMode = "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";

interface BotSettings {
  strategyMode?: StrategyMode;
  [key: string]: unknown;
}

const MODE_INFO: Record<
  StrategyMode,
  { title: string; strategy: string; description: string; accent: string }
> = {
  CONSERVATIVE: {
    title: "Conservative",
    strategy: "EMA_CROSSOVER",
    description:
      "Sinyal cuma dari persilangan EMA fast/slow. Paling sedikit indikator, paling jarang trading, cocok kalau prioritas utama menghindari sinyal palsu.",
    accent: "border-sky-500/40 bg-sky-500/5",
  },
  BALANCED: {
    title: "Balanced (default)",
    strategy: "AURA_TREND",
    description:
      "EMA + MACD + ADX + RSI + Stochastic digabung berbobot. Titik tengah antara jumlah trade dan ketelitian sinyal.",
    accent: "border-emerald-500/40 bg-emerald-500/5",
  },
  AGGRESSIVE: {
    title: "Aggressive",
    strategy: "MOMENTUM",
    description:
      "Fokus ke momentum jangka pendek. Trading lebih sering, tapi lebih rentan whipsaw di pasar sideways.",
    accent: "border-amber-500/40 bg-amber-500/5",
  },
};

export default function StrategySettings() {
  const [current, setCurrent] = useState<StrategyMode>("BALANCED");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error(`Gagal memuat settings: ${res.status}`);
        const json = await res.json();
        const data: BotSettings = json.data;
        setCurrent(data.strategyMode ?? "BALANCED");
      } catch (err) {
        console.error("[StrategySettings] Failed to load:", err);
        setError("Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSelect(mode: StrategyMode) {
    if (mode === current) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    // Optimistic update, dibalik kalau gagal.
    const previous = current;
    setCurrent(mode);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyMode: mode }),
      });

      if (!res.ok) throw new Error(`Gagal menyimpan: ${res.status}`);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[StrategySettings] Failed to save:", err);
      setError("Gagal menyimpan pengaturan.");
      setCurrent(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="card space-y-6">
        <div>
          <h1 className="text-xl font-bold">Strategy Mode</h1>
          <p className="text-xs text-slate-500 mt-1">
            Menentukan strategi mana yang jadi sumber sinyal utama BUY/SELL/HOLD.
            Berlaku untuk semua pair, efektif di siklus trading berikutnya.
          </p>
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="grid gap-3">
          {(Object.keys(MODE_INFO) as StrategyMode[]).map((mode) => {
            const info = MODE_INFO[mode];
            const isActive = current === mode;

            return (
              <button
                key={mode}
                type="button"
                disabled={loading || saving}
                onClick={() => handleSelect(mode)}
                className={`text-left rounded-lg border px-4 py-3 transition ${
                  isActive
                    ? info.accent
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                } ${loading || saving ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-100">
                    {info.title}
                    <span className="text-xs text-slate-500 font-normal ml-2">
                      ({info.strategy})
                    </span>
                  </p>
                  {isActive && (
                    <span className="text-xs text-emerald-400 font-medium">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{info.description}</p>
              </button>
            );
          })}
        </div>

        <p className="text-xs h-4">
          {saving && <span className="text-slate-400">Menyimpan...</span>}
          {saved && <span className="text-emerald-400">Tersimpan ✓</span>}
        </p>
      </div>
    </DashboardLayout>
  );
}
