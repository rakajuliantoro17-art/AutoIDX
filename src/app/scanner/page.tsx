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
import { useAuth } from "@/services/auth/AuthContext";
import type { ScannedPairResult } from "@/services/scanner/types";

function formatPair(pair: string) {
  const [base, quote] = pair.split("_");
  return `${base?.toUpperCase()}/${quote?.toUpperCase()}`;
}

function signalColor(signal: string) {
  // PERBAIKAN: "STRONG_BUY" sebelumnya jatuh ke warna netral abu-abu
  // (fallback di bawah) karena hanya dicek === "BUY" persis -- padahal
  // itu kategori sinyal PALING bullish, seharusnya hijau (malah lebih
  // ditekankan dari BUY biasa), bukan disamakan visualnya dengan
  // WAIT/AVOID yang justru netral/menunggu.
  if (signal === "STRONG_BUY")
    return "text-emerald-300 bg-emerald-500/20 font-bold";
  if (signal === "BUY") return "text-emerald-400 bg-emerald-500/10";
  if (signal === "SELL") return "text-red-400 bg-red-500/10";
  return "text-[var(--text-secondary)] bg-white/5";
}

function trendColor(trend: string) {
  if (trend === "BULLISH") return "text-emerald-400";
  if (trend === "BEARISH") return "text-red-400";
  return "text-[var(--text-secondary)]";
}

function aiDirectionColor(direction?: string) {
  if (direction === "BULLISH") return "text-emerald-400";
  if (direction === "BEARISH") return "text-red-400";
  return "text-[var(--text-muted)]";
}

// Sinyal bot ASLI (dari bot_state, hasil TradingEngine) memakai sistem
// 3-nilai yang berbeda dari signalRecommendation Scanner (5-nilai,
// STRONG_BUY/BUY/WAIT/AVOID/SELL) -- lihat catatan di komentar kolom
// tabel "Sinyal Bot Asli" untuk konteks lengkap kenapa keduanya bisa
// tidak sama untuk pair yang sama.
function botSignalColor(signal: string) {
  if (signal === "BUY") return "text-emerald-400 bg-emerald-500/10";
  if (signal === "SELL") return "text-red-400 bg-red-500/10";
  return "text-[var(--text-secondary)] bg-white/5";
}

export default function ScannerPage() {
  const { user } = useAuth();

  const [results, setResults] = useState<ScannedPairResult[]>([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Peta pair -> sinyal bot asli (BUY/SELL/HOLD dari bot_state),
  // KHUSUS pair yang ada di watchlist bot (10 pair tetap di
  // config/trading.ts) -- lihat komentar useEffect di bawah.
  const [botSignals, setBotSignals] = useState<Record<string, string>>({});

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

  // Sinyal bot ASLI, khusus untuk pair watchlist -- dipisah dari
  // polling scanner di atas (30 detik) karena bot_state cuma berubah
  // sekali per siklus cron (beberapa menit), jadi refresh tiap 30
  // detik untuk data ini cuma buang-buang read Firestore percuma.
  // Butuh login (Bearer token) karena /api/bot/pairs & /api/bot/state
  // memang endpoint terproteksi, beda dari /api/market di atas yang
  // publik.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadBotSignals() {
      try {
        const idToken = await user!.getIdToken();

        const pairsRes = await fetch("/api/bot/pairs", {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!pairsRes.ok) return;

        const pairsJson = await pairsRes.json();
        const watchlist: string[] = pairsJson.pairs ?? [];

        const entries = await Promise.all(
          watchlist.map(async (pair) => {
            try {
              const stateRes = await fetch(
                `/api/bot/state?pair=${encodeURIComponent(pair)}`,
                { headers: { Authorization: `Bearer ${idToken}` } }
              );

              if (!stateRes.ok) return null;

              const stateJson = await stateRes.json();
              return [pair, stateJson.lastSignal ?? "HOLD"] as const;
            } catch {
              return null;
            }
          })
        );

        if (!cancelled) {
          const map: Record<string, string> = {};
          for (const entry of entries) {
            if (entry) map[entry[0]] = entry[1];
          }
          setBotSignals(map);
        }
      } catch {
        // Gagal diam-diam -- kolom "Sinyal Bot Asli" akan tampil
        // "—" untuk semua pair (lihat fallback di render), bukan
        // memblokir tabel scanner utama yang tetap harus tampil.
      }
    }

    loadBotSignals();
    const botInterval = setInterval(loadBotSignals, 60000);

    return () => {
      cancelled = true;
      clearInterval(botInterval);
    };
  }, [user]);

  // PERBAIKAN: sebelumnya cuma cocok string "BUY" persis, jadi pair
  // dengan skor >= 85 (dikategorikan "STRONG_BUY" -- sinyal PALING
  // kuat, lebih bagus dari "BUY" biasa) tidak pernah ikut terhitung
  // di sini. Akibatnya kartu ini bisa menunjukkan 0 padahal ada
  // peluang STRONG_BUY yang aktif -- inkonsisten dengan halaman lain
  // (mis. Dashboard) yang memakai sistem sinyal lebih sederhana
  // (BUY/SELL/HOLD) dan tetap menandai peluang itu sebagai "BUY".
  const buySignals = results.filter(
    (r) =>
      r.signalRecommendation === "BUY" ||
      r.signalRecommendation === "STRONG_BUY"
  ).length;

  return (
    <section className="space-y-8">
      <div className="glass p-8">
        <h1 className="text-3xl font-bold">Market Scanner</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Opportunity detection engine — RSI, EMA, dan skor peluang dihitung
          live dari data Indodax
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-[var(--text-secondary)]">Pair Dipindai</p>
          <h2 className="text-3xl font-bold mt-2">{scannedCount}</h2>
        </div>

        <div className="card">
          <p className="text-sm text-[var(--text-secondary)]">Lolos Kriteria</p>
          <h2 className="text-3xl font-bold mt-2">{results.length}</h2>
        </div>

        <div className="card">
          <p className="text-sm text-[var(--text-secondary)]">Sinyal BUY</p>
          <h2 className="text-3xl font-bold text-emerald-400 mt-2">
            {buySignals}
          </h2>
        </div>

        <div className="card">
          <p className="text-sm text-[var(--text-secondary)]">Scanner Status</p>
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
              <tr className="border-b border-white/10 text-[var(--text-secondary)] text-sm">
                <th className="text-left py-3">Pair</th>
                <th className="text-left">Harga</th>
                <th className="text-left">RSI(14)</th>
                <th className="text-left">Trend</th>
                <th className="text-left">Opportunity Score</th>
                <th className="text-left">Sinyal</th>
                <th className="text-left">
                  Sinyal Bot Asli
                  <span className="text-[var(--text-muted)] font-normal"> (watchlist)</span>
                </th>
                <th className="text-left">Confidence</th>
                <th className="text-left">
                  AI Score
                  <span className="text-[var(--text-muted)] font-normal"> (beta)</span>
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
                        <span className="text-xs text-[var(--text-secondary)]">
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
                    <td>
                      {item.pair in botSignals ? (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${botSignalColor(
                            botSignals[item.pair]
                          )}`}
                          title="Sinyal aktual dari TradingEngine (bot_state), bukan skor Scanner"
                        >
                          {botSignals[item.pair]}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs" title="Pair ini tidak ada di watchlist bot (config/trading.ts)">
                          Bukan watchlist
                        </span>
                      )}
                    </td>
                    <td>{item.confidence}%</td>
                    <td>
                      {item.aiDirection ? (
                        <span className={`text-xs font-semibold ${aiDirectionColor(item.aiDirection)}`}>
                          {item.aiDirection}
                          {typeof item.aiScore === "number" && (
                            <span className="text-[var(--text-muted)] font-normal">
                              {" "}({item.aiScore.toFixed(2)})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}

              {!loading && results.length === 0 && !error && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[var(--text-muted)]">
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
