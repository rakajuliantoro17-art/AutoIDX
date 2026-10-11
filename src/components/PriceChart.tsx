/**
==========================================================
AURA Trade OS
Price Chart Component (SVG candlestick, tanpa dependency)
==========================================================
*/
import { useEffect, useState } from "react";

interface PriceChartProps {
  pair: string;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const TIMEFRAMES = [
  { label: "15m", value: "15" },
  { label: "1h", value: "60" },
  { label: "4h", value: "240" },
  { label: "1D", value: "1D" },
];

const W = 640;
const H = 256;
const PAD_R = 64;
const PAD_Y = 12;

export default function PriceChart({ pair }: PriceChartProps) {
  const [resolution, setResolution] = useState("60");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(
          `/api/market/${encodeURIComponent(pair)}/candles?resolution=${resolution}&limit=80`
        );
        if (!r.ok) throw new Error("Gagal memuat candle");
        const j = await r.json();
        if (!cancelled) {
          setCandles(Array.isArray(j.candles) ? j.candles : []);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setLoading(true);
    load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [pair, resolution]);

  const hi = candles.length ? Math.max(...candles.map((c) => c.high)) : 0;
  const lo = candles.length ? Math.min(...candles.map((c) => c.low)) : 0;
  const span = hi - lo || 1;
  const y = (p: number) => PAD_Y + ((hi - p) / span) * (H - PAD_Y * 2);
  const step = candles.length ? (W - PAD_R) / candles.length : 1;
  const last = candles[candles.length - 1];
  const fmt = (n: number) => n.toLocaleString("id-ID", { maximumFractionDigits: 8 });

  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-bold">{pair.toUpperCase()} Price Chart</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {last ? `Terakhir: Rp ${fmt(last.close)}` : "Market Visualization"}
          </p>
        </div>
        <div className="flex gap-1">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setResolution(t.value)}
              className={`text-xs px-2 py-1 rounded ${
                resolution === t.value
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 rounded-xl bg-black/20 border border-white/10 overflow-hidden">
        {error && !candles.length ? (
          <div className="h-full flex items-center justify-center text-sm text-red-400">
            {error}
          </div>
        ) : loading && !candles.length ? (
          <div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">
            Memuat grafik...
          </div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const p = hi - f * span;
              const yy = y(p);
              return (
                <g key={f}>
                  <line x1={0} x2={W - PAD_R} y1={yy} y2={yy} stroke="rgba(255,255,255,0.06)" />
                  <text x={W - PAD_R + 4} y={yy + 3} fontSize="9" fill="rgba(255,255,255,0.45)">
                    {fmt(Math.round(p))}
                  </text>
                </g>
              );
            })}
            {candles.map((c, i) => {
              const x = i * step + step / 2;
              const up = c.close >= c.open;
              const color = up ? "#34d399" : "#f87171";
              const top = y(Math.max(c.open, c.close));
              const bh = Math.max(Math.abs(y(c.open) - y(c.close)), 1);
              return (
                <g key={c.time}>
                  <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke={color} />
                  <rect x={x - step * 0.3} y={top} width={step * 0.6} height={bh} fill={color} />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
