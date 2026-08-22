/**
==========================================================
AURA Trade OS
Market Scanner Page
Version : 0.0.9 Alpha
==========================================================
*/

"use client";

import { useEffect, useState } from "react";
import { formatIDR } from "@/utils";

interface ScannedPairResult {
  pair: string;
  symbol: string;
  lastPrice: number;
  volIdr: number;
  change24h?: number;
  rsi14: number;
  emaFast: number;
  emaSlow: number;
  trend: "BULLISH" | "BEARISH" | "SIDEWAYS";
  opportunityScore: number;
  confidence: number;
  signalRecommendation: "BUY" | "SELL" | "HOLD";
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  aiScore?: number;
  aiDirection?: "BULLISH" | "BEARISH" | "NEUTRAL";
  aiConfidence?: number;
}

function formatPair(pair: string) {
  const [base, quote] = pair.split("_");
  return `${base?.toUpperCase()}/${quote?.toUpperCase()}`;
}

function signalColor(signal: string) {
  if (signal === "BUY") return "text-emerald-400 bg-emerald-500/10";
  if (signal === "SELL") return "text-red-400 bg-red-500/10";
  return "text-slate-400 bg-white/5";
}

function trendColor(trend: string) {
  if (trend === "BULLISH") return "text-emerald-400";
  if (trend === "BEARISH") return "text-red-400";
  return "text-slate-400";
}

function aiDirectionColor(direction?: string) {
  if (direction === "BULLISH") return "text-emerald-400";
  if (direction === "BEARISH") return "text-red-400";
  return "text-slate-500";
}

export default function ScannerPage() {
  const [results, setResults] = useState<ScannedPairResult[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/market");
        const json = await res.json();

        if (!cancelled) {
          if (json.success) {
            setResults(json.data);
            setScannedCount(json.scannedCount ?? 0);
          } else {
            setError(json.error ?? "Gagal memuat data scanner.");
          }
        }
      } catch {
        if (!cancelled) setError("Gagal terhubung ke API market.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const buySignals = results.filter((r) => r.signalRecommendation === "BUY").length;

  return (
    <section className="space-y-8">
      <div className="glass p-8">
        <h1 className="text-3xl font-bold">Market Scanner</h1>
        <p className="text-slate-400 mt-2">
          Opportunity detection engine — RSI, EMA, dan skor peluang dihitung
          live dari data Indodax
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-400">Pair Dipindai</p>
          <h2 className="text-3xl font-bold mt-2">{scannedCount}</h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Lolos Kriteria</p>
          <h2 className="text-3xl font-bold mt-2">{results.length}</h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Sinyal BUY</p>
          <h2 className="text-3xl font-bold text-emerald-400 mt-2">
            {buySignals}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-slate-400">Scanner Status</p>
          <h2
            className={`text-3xl font-bold mt-2 ${
              loading ? "text-yellow-400" : error ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {loading ? "SCANNING" : error ? "ERROR" : "LIVE"}
          </h2>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Opportunity Ranking</h2>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="text-left py-3">Pair</th>
                <th className="text-left">Harga</th>
                <th className="text-left">RSI(14)</th>
                <th className="text-left">Trend</th>
                <th className="text-left">Opportunity Score</th>
                <th className="text-left">Sinyal</th>
                <th className="text-left">Confidence</th>
                <th className="text-left">
                  AI Score
                  <span className="text-slate-600 font-normal"> (beta)</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {results
                .sort((a, b) => b.opportunityScore - a.opportunityScore)
                .map((item) => (
                  <tr key={item.pair} className="border-b border-white/5">
                    <td className="py-4 font-semibold">{formatPair(item.pair)}</td>
                    <td>{formatIDR(item.lastPrice)}</td>
                    <td>{item.rsi14.toFixed(1)}</td>
                    <td className={trendColor(item.trend)}>{item.trend}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-400"
                            style={{ width: `${item.opportunityScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">
                          {item.opportunityScore}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${signalColor(
                          item.signalRecommendation
                        )}`}
                      >
                        {item.signalRecommendation}
                      </span>
                    </td>
                    <td>{item.confidence}%</td>
                    <td>
                      {item.aiDirection ? (
                        <span className={`text-xs font-semibold ${aiDirectionColor(item.aiDirection)}`}>
                          {item.aiDirection}
                          {typeof item.aiScore === "number" && (
                            <span className="text-slate-500 font-normal">
                              {" "}({item.aiScore.toFixed(2)})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}

              {!loading && results.length === 0 && !error && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Belum ada pair yang memenuhi kriteria minimum volume.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
