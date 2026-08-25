/**
==========================================================
AURA Trade OS
Settings Control Panel
Version : 0.1.0 Alpha

Perubahan dari 0.0.2: section "Risk Management", "AI Confidence
Threshold", dan "Allowed Trading Pair" sebelumnya baca dari
object `config` hardcode -- NILAINYA SALAH (stopLoss:2 padahal
RISK_CONFIG.stopLossPercent aslinya 1, pairs hardcode BTC/ETH/SOL
padahal env BOT_PAIRS bisa beda). Sekarang fetch dari
/api/settings/config (baca BOT_CONFIG/RISK_CONFIG/TRADING_CONFIG
+ bot_control asli), auto-refresh tiap 10 detik.

IndodaxAccountManager & BotControlPanel TIDAK diubah -- keduanya
sudah nyambung ke data asli dari sebelumnya.
==========================================================
*/
"use client";

import { useEffect, useState, useCallback } from "react";
import { formatIDR } from "@/utils";
import { REFRESH_INTERVALS } from "@/utils/constants";
import Link from "next/link";
import DashboardLayout from "@/layouts/DashboardLayout";
import IndodaxAccountManager from "@/components/IndodaxAccountManager";
import BotControlPanel from "@/components/BotControlPanel";
import { useAuth } from "@/services/auth/AuthContext";

interface RuntimeConfig {
  mode: string;
  emergencyStop: boolean;
  tradeAmount: number;
  maxTradeAmount: number;
  startingBalance: number;
  slTpMode: string;
  stopLossBaselinePercent: number;
  targetProfitBaselinePercent: number;
  maxOpenPosition: number;
  maxExposurePercent: number;
  maxDailyLossPercent: number;
  cooldownSeconds: number;
  trailingStop: { enabled: boolean; percent: number };
  pairs: string[];
  fullPairMode: boolean;
  minVolumeIdr: number;
  cronIntervalSeconds: number;
}

const REFRESH_INTERVAL_MS = REFRESH_INTERVALS.STATUS_MS;

const EMPTY_CONFIG: RuntimeConfig = {
  mode: "paper",
  emergencyStop: false,
  tradeAmount: 0,
  maxTradeAmount: 0,
  startingBalance: 0,
  slTpMode: "ATR",
  stopLossBaselinePercent: 0,
  targetProfitBaselinePercent: 0,
  maxOpenPosition: 0,
  maxExposurePercent: 0,
  maxDailyLossPercent: 0,
  cooldownSeconds: 0,
  trailingStop: { enabled: false, percent: 0 },
  pairs: [],
  fullPairMode: false,
  minVolumeIdr: 0,
  cronIntervalSeconds: 0,
};

export default function SettingsPage() {

  const { user } = useAuth();

  const [config, setConfig] = useState<RuntimeConfig>(EMPTY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {

    if (!user) return;

    try {

      const idToken = await user.getIdToken();

      const response = await fetch("/api/settings/config", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Gagal memuat konfigurasi.");
      }

      setConfig(json);
      setError(null);

    } catch (err) {

      console.error("[SettingsPage] Failed to fetch config:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat konfigurasi."
      );

    } finally {
      setLoading(false);
    }

  }, [user]);

  useEffect(() => {

    fetchConfig();

    const interval = setInterval(fetchConfig, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);

  }, [fetchConfig]);

  return (
    <DashboardLayout>
      <section className="space-y-8">

        <div className="glass p-8">
          <h1 className="text-3xl font-bold">AURA Trade OS Settings</h1>
          <p className="text-slate-400 mt-2">
            Trading configuration and risk management
            {loading ? " — memuat..." : ""}
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Link ke editor detail -- IndodaxAccountManager & BotControlPanel
            di bawah ini sudah live (embed langsung), tapi Risk & Strategy
            di bawah masih READ-ONLY (baca BOT_CONFIG/RISK_CONFIG statis).
            Untuk EDIT nilai yang benar-benar dipakai bot (BotSettings via
            effectiveConfig), pakai halaman detail berikut. */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/settings/risk"
            className="card block hover:border-sky-500/40 transition"
          >
            <p className="font-semibold text-slate-100">
              Edit Risk Management →
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Trade amount, stop loss, take profit, max position -- bisa
              diubah tanpa redeploy.
            </p>
          </Link>
          <Link
            href="/settings/strategy"
            className="card block hover:border-sky-500/40 transition"
          >
            <p className="font-semibold text-slate-100">
              Edit Strategy Mode →
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Conservative / Balanced / Aggressive -- sumber sinyal utama.
            </p>
          </Link>
        </div>

        {/* Section: Trade API Account -- sudah nyambung data asli sebelumnya */}
        <IndodaxAccountManager />

        {/* Section: Emergency Stop + Paper/Live toggle -- sudah nyambung data asli sebelumnya */}
        <BotControlPanel />

        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Risk Management</h2>
          <div className="grid md:grid-cols-4 gap-5">
            <div>
              <p className="text-xs text-slate-500">Trade Amount</p>
              <p className="font-bold mt-2">
                {formatIDR(config.tradeAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">
                Target Profit
              </p>
              <p className="font-bold text-emerald-400 mt-2">
                {config.targetProfitBaselinePercent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">
                Stop Loss
              </p>
              <p className="font-bold text-red-400 mt-2">
                {config.stopLossBaselinePercent}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Max Open Position</p>
              <p className="font-bold mt-2">{config.maxOpenPosition}</p>
            </div>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Mode SL/TP saat ini: <span className="text-sky-400">Persentase statis</span>
            {" "}
            -- angka di atas dipakai APA ADANYA untuk semua pair
            (belum menyesuaikan volatilitas per pair).
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-5 border-t border-white/10 pt-6">
            <div>
              <p className="text-xs text-slate-500">Max Exposure / Trade</p>
              <p className="font-bold mt-2">{config.maxExposurePercent}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Max Daily Loss</p>
              <p className="font-bold mt-2">{config.maxDailyLossPercent}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Cooldown Antar Trade</p>
              <p className="font-bold mt-2">{config.cooldownSeconds} detik</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-5">
            Trading Pair Universe
          </h2>

          {config.fullPairMode ? (
            <div>
              <p className="text-slate-400">
                Mode <span className="text-sky-400">Full Pair</span> aktif --
                scanner memindai SEMUA pair IDR di Indodax dengan volume 24
                jam minimal {formatIDR(config.minVolumeIdr)}, bukan daftar
                tetap.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {config.pairs.length === 0 && (
                <p className="text-slate-500">Belum ada pair terdaftar.</p>
              )}
              {config.pairs.map((pair) => (
                <span
                  key={pair}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm uppercase"
                >
                  {pair}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="card border border-dashed border-white/10">
          <h2 className="text-xl font-semibold">Future Configuration</h2>
          <ul className="mt-4 text-slate-400 space-y-2">
            <li>• Edit config langsung dari dashboard (saat ini lewat env var Vercel + redeploy)</li>
            <li>• Telegram notification</li>
            <li>• AI risk adjustment</li>
          </ul>
        </div>

      </section>
    </DashboardLayout>
  );

}
