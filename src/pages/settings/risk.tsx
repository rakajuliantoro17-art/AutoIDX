/**
==========================================================
AURA Trade OS
Risk Settings
Version : 0.1.0 Alpha

Trade Amount sekarang bisa diatur lewat slider (Rp10.500 -
Rp25.000), tersimpan ke Firestore lewat /api/settings, dan
langsung dipakai oleh PaperTradingService.buy() (services/
trading/paper.ts) - tanpa perlu redeploy.
==========================================================
*/

import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";

const TRADE_AMOUNT_MIN = 10_500;
const TRADE_AMOUNT_MAX = 25_000;
const TRADE_AMOUNT_STEP = 500;

interface BotSettings {
  version: string;
  mode: "paper" | "live";
  enabled: boolean;
  tradeAmountIdr: number;
  targetProfitPercent: number;
  stopLossPercent: number;
  maxOpenPositions: number;
  scanIntervalMinutes: number;
  pairs: string[];
}

export default function RiskSettings() {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [tradeAmount, setTradeAmount] = useState(TRADE_AMOUNT_MIN);
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
        setSettings(json.data);
        setTradeAmount(
          Math.min(
            Math.max(json.data.tradeAmountIdr, TRADE_AMOUNT_MIN),
            TRADE_AMOUNT_MAX
          )
        );
      } catch (err) {
        console.error("[RiskSettings] Failed to load:", err);
        setError("Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(nextAmount: number) {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradeAmountIdr: nextAmount }),
      });

      if (!res.ok) throw new Error(`Gagal menyimpan: ${res.status}`);

      const json = await res.json();
      setSettings(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("[RiskSettings] Failed to save:", err);
      setError("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  }

  function handleSliderChange(value: number) {
    setTradeAmount(value);
  }

  function handleSliderCommit(value: number) {
    handleSave(value);
  }

  return (
    <DashboardLayout>
      <div className="card space-y-6">
        <h1 className="text-xl font-bold">Risk Management</h1>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Trade Amount - slider interaktif */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-slate-400 text-sm">Trade Amount</p>
            <p className="text-sky-400 font-bold">
              {loading
                ? "..."
                : `Rp ${tradeAmount.toLocaleString("id-ID")}`}
            </p>
          </div>

          <input
            type="range"
            min={TRADE_AMOUNT_MIN}
            max={TRADE_AMOUNT_MAX}
            step={TRADE_AMOUNT_STEP}
            value={tradeAmount}
            disabled={loading || saving}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            onMouseUp={(e) =>
              handleSliderCommit(Number((e.target as HTMLInputElement).value))
            }
            onTouchEnd={(e) =>
              handleSliderCommit(Number((e.target as HTMLInputElement).value))
            }
            className="w-full accent-sky-500"
          />

          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Rp {TRADE_AMOUNT_MIN.toLocaleString("id-ID")}</span>
            <span>Rp {TRADE_AMOUNT_MAX.toLocaleString("id-ID")}</span>
          </div>

          <p className="text-xs mt-2 h-4">
            {saving && <span className="text-slate-400">Menyimpan...</span>}
            {saved && <span className="text-emerald-400">Tersimpan ✓</span>}
          </p>
        </div>

        {/* Stop Loss - masih read-only, sumbernya RISK_CONFIG (env var) */}
        <div>
          <p className="text-slate-400 text-sm">Stop Loss</p>
          <p className="text-rose-400 font-bold">
            {loading ? "..." : `${settings?.stopLossPercent ?? "-"}%`}
          </p>
        </div>

        {/* Take Profit - masih read-only, sumbernya RISK_CONFIG (env var) */}
        <div>
          <p className="text-slate-400 text-sm">Take Profit</p>
          <p className="text-emerald-400 font-bold">
            {loading ? "..." : `${settings?.targetProfitPercent ?? "-"}%`}
          </p>
        </div>

        {/* Max Position - masih read-only, sumbernya RISK_CONFIG (env var) */}
        <div>
          <p className="text-slate-400 text-sm">Max Position</p>
          <p>{loading ? "..." : settings?.maxOpenPositions ?? "-"}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
