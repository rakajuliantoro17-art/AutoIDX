/**
==========================================================
AURA Trade OS
Risk Settings
Version : 0.2.0 Alpha

Perubahan dari 0.1.0: Stop Loss / Take Profit / Max Position
SEBELUMNYA cuma display read-only dengan catatan "sumbernya
RISK_CONFIG (env var)" -- itu akurat waktu itu karena memang
BELUM ADA kode yang membaca BotSettings.stopLossPercent/
targetProfitPercent/maxOpenPositions sama sekali.

Sekarang SUDAH -- lewat services/trading/effectiveConfig.ts
(getEffectiveTradingConfig), yang dipakai trading/engine.ts
untuk: (1) rasio risk:reward dasar ATR stop-loss/take-profit
(RiskManager.calculateAtrStopLevels), (2) batas jumlah posisi
terbuka. Nilai di sini SEKARANG benar-benar dipakai, TAPI
selalu di-clamp ke batas aman (lihat MIN/MAX di
effectiveConfig.ts) supaya tidak bisa diisi angka ekstrem dari
dashboard tanpa redeploy.

Trade Amount tetap seperti 0.1.0: slider Rp10.500-Rp25.000,
tersimpan ke Firestore lewat /api/settings, dipakai
PaperTradingService.buy() DAN LiveTradingService.buy() (mode
live -- lihat effectiveConfig.ts, sekarang dikirim eksplisit
dari engine.ts, bukan fallback implisit lagi).
==========================================================
*/

import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";

// Minimum transaksi Indodax adalah Rp10.000 (Rp10.000-24.999 diproses
// lewat "Indodax Lite", >=Rp25.000 lewat "Indodax Pro" -- keduanya
// sama-sama valid, cuma beda jalur internal, help.indodax.com).
// Selaras dengan MIN_TRADE_AMOUNT_IDR di
// services/trading/effectiveConfig.ts -- kalau diubah di sana, ubah
// juga di sini.
const TRADE_AMOUNT_MIN = 10_000;
const TRADE_AMOUNT_MAX = 500_000;
const TRADE_AMOUNT_STEP = 5_000;

// Selaras dengan MIN/MAX di services/trading/effectiveConfig.ts --
// kalau diubah di sana, ubah juga di sini supaya UI tidak
// menjanjikan rentang yang beda dari yang sebenarnya di-clamp.
const STOP_LOSS_MIN = 0.1;
const STOP_LOSS_MAX = 20;
const TARGET_PROFIT_MIN = 0.1;
const TARGET_PROFIT_MAX = 50;
const MAX_POSITIONS_MIN = 1;

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
  strategyMode?: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";
}

type FieldKey =
  | "tradeAmountIdr"
  | "stopLossPercent"
  | "targetProfitPercent"
  | "maxOpenPositions";

export default function RiskSettings() {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [tradeAmount, setTradeAmount] = useState(TRADE_AMOUNT_MIN);
  const [stopLoss, setStopLoss] = useState(1);
  const [targetProfit, setTargetProfit] = useState(3);
  const [maxPositions, setMaxPositions] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<FieldKey | null>(null);
  const [savedField, setSavedField] = useState<FieldKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error(`Gagal memuat settings: ${res.status}`);
        const json = await res.json();
        const data: BotSettings = json.data;
        setSettings(data);
        setTradeAmount(
          Math.min(Math.max(data.tradeAmountIdr, TRADE_AMOUNT_MIN), TRADE_AMOUNT_MAX)
        );
        setStopLoss(data.stopLossPercent ?? 1);
        setTargetProfit(data.targetProfitPercent ?? 3);
        setMaxPositions(data.maxOpenPositions ?? 1);
      } catch (err) {
        console.error("[RiskSettings] Failed to load:", err);
        setError("Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(field: FieldKey, value: number) {
    setSavingField(field);
    setSavedField(null);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error(`Gagal menyimpan: ${res.status}`);

      const json = await res.json();
      setSettings(json.data);
      setSavedField(field);
      setTimeout(() => setSavedField(null), 2000);
    } catch (err) {
      console.error("[RiskSettings] Failed to save:", err);
      setError("Gagal menyimpan pengaturan.");
    } finally {
      setSavingField(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="card space-y-6">
        <div>
          <h1 className="text-xl font-bold">Risk Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Nilai di sini benar-benar dipakai bot (lewat effectiveConfig),
            tapi selalu dibatasi ke rentang aman supaya tidak bisa diisi
            angka ekstrem tanpa redeploy.
          </p>
        </div>

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
              {loading ? "..." : `Rp ${tradeAmount.toLocaleString("id-ID")}`}
            </p>
          </div>

          <input
            type="range"
            min={TRADE_AMOUNT_MIN}
            max={TRADE_AMOUNT_MAX}
            step={TRADE_AMOUNT_STEP}
            value={tradeAmount}
            disabled={loading || savingField === "tradeAmountIdr"}
            onChange={(e) => setTradeAmount(Number(e.target.value))}
            onMouseUp={(e) =>
              handleSave("tradeAmountIdr", Number((e.target as HTMLInputElement).value))
            }
            onTouchEnd={(e) =>
              handleSave("tradeAmountIdr", Number((e.target as HTMLInputElement).value))
            }
            className="w-full accent-sky-500"
          />

          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Rp {TRADE_AMOUNT_MIN.toLocaleString("id-ID")}</span>
            <span>Rp {TRADE_AMOUNT_MAX.toLocaleString("id-ID")}</span>
          </div>

          <SaveStatus field="tradeAmountIdr" savingField={savingField} savedField={savedField} />
        </div>

        {/* Stop Loss - sekarang editable, dipakai ATR SL base ratio */}
        <NumberField
          label="Stop Loss (%)"
          hint="Dasar rasio ATR stop-loss (lihat risk.ts calculateAtrStopLevels). Lebar aktual tetap menyesuaikan volatilitas pair."
          value={stopLoss}
          min={STOP_LOSS_MIN}
          max={STOP_LOSS_MAX}
          step={0.1}
          disabled={loading}
          saving={savingField === "stopLossPercent"}
          saved={savedField === "stopLossPercent"}
          accent="text-rose-400"
          onChange={setStopLoss}
          onCommit={(v) => handleSave("stopLossPercent", v)}
        />

        {/* Take Profit - sekarang editable */}
        <NumberField
          label="Take Profit (%)"
          hint="Dasar rasio ATR take-profit."
          value={targetProfit}
          min={TARGET_PROFIT_MIN}
          max={TARGET_PROFIT_MAX}
          step={0.1}
          disabled={loading}
          saving={savingField === "targetProfitPercent"}
          saved={savedField === "targetProfitPercent"}
          accent="text-emerald-400"
          onChange={setTargetProfit}
          onCommit={(v) => handleSave("targetProfitPercent", v)}
        />

        {/* Max Position - sekarang editable, dipakai gate jumlah posisi terbuka */}
        <NumberField
          label="Max Open Position"
          hint={`Dibatasi maksimum ke nilai RISK_CONFIG.maxOpenPosition (env var) kalau diisi lebih besar.`}
          value={maxPositions}
          min={MAX_POSITIONS_MIN}
          max={99}
          step={1}
          disabled={loading}
          saving={savingField === "maxOpenPositions"}
          saved={savedField === "maxOpenPositions"}
          accent="text-sky-300"
          onChange={setMaxPositions}
          onCommit={(v) => handleSave("maxOpenPositions", v)}
        />
      </div>
    </DashboardLayout>
  );
}

function SaveStatus({
  field,
  savingField,
  savedField,
}: {
  field: FieldKey;
  savingField: FieldKey | null;
  savedField: FieldKey | null;
}) {
  return (
    <p className="text-xs mt-2 h-4">
      {savingField === field && <span className="text-slate-400">Menyimpan...</span>}
      {savedField === field && <span className="text-emerald-400">Tersimpan ✓</span>}
    </p>
  );
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  disabled,
  saving,
  saved,
  accent,
  onChange,
  onCommit,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  saving: boolean;
  saved: boolean;
  accent: string;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-slate-400 text-sm">{label}</p>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled || saving}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={(e) => {
            const clamped = Math.min(max, Math.max(min, Number(e.target.value)));
            onChange(clamped);
            onCommit(clamped);
          }}
          className={`bg-slate-900/60 border border-slate-700 rounded-md px-2 py-1 w-24 text-right font-bold ${accent}`}
        />
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <p className="text-xs mt-1 h-4">
        {saving && <span className="text-slate-400">Menyimpan...</span>}
        {saved && <span className="text-emerald-400">Tersimpan ✓</span>}
      </p>
    </div>
  );
}
