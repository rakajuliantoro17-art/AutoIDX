/**
==========================================================
AURA Trade OS
Ops Agent -- analisis (MURNI, tanpa I/O)
==========================================================
Aturan deterministik yang menghasilkan laporan 4 peran dan usulan.
Dipisah dari I/O agar bisa diuji dan hasilnya selalu bisa dijelaskan.
==========================================================
*/

import { WATCHLIST_TARGET } from "./types";
import type { OpsAnalysis, OpsInput, RecommendationDraft, SectionReport } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_SCORED_FOR_JUDGEMENT = 30;
const PERIOD_MS = 30 * DAY_MS;
/** Perkiraan biaya pulang-pergi (fee + slippage) agar angka tidak terlalu optimistis. */
const ROUND_TRIP_COST_PCT = 0.6;
const MIN_CLOSED_FOR_EXPANSION = 20;
const WIN_RATE_FOR_EXPANSION = 0.55;
const SOURCE_NAMES: Record<string, string> = {
  ml: "ML internal",
  "llm:openai": "ChatGPT",
  "llm:gemini": "Gemini",
  "llm:claude": "Claude",
  "llm:deepseek": "DeepSeek",
  "llm:consensus": "Konsensus AI",
};

const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
const upper = (p: string) => p.replace("_", "/").toUpperCase();

/** Kunci minggu ISO, mis. 2026W41 (berdasarkan WIB). */
export function isoWeekKey(ms: number): string {
  const d = new Date(ms + 7 * 3600_000);
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}W${String(week).padStart(2, "0")}`;
}

export function analyzeOps(input: OpsInput): OpsAnalysis {
  const recs: RecommendationDraft[] = [];
  const since = input.nowMs - DAY_MS;

  const logs24 = input.logs.filter((l) => l.ts >= since);
  const errors = logs24.filter((l) => l.type === "danger").length;
  const warnings = logs24.filter((l) => l.type === "warning").length;
  const blocked = logs24.filter((l) => l.message.includes("Batas posisi terbuka tercapai")).length;
  const trades24 = input.trades.filter((t) => t.ts >= since);
  const newestLog = input.logs.reduce((m, l) => Math.max(m, l.ts), 0);
  const lastLogAgeMinutes = newestLog ? Math.round((input.nowMs - newestLog) / 60000) : null;

  // ---------------- HRD: kinerja "tim AI" ----------------
  const hrd: string[] = [];
  const ranked = Object.entries(input.aiScores)
    .filter(([, s]) => s.scored >= MIN_SCORED_FOR_JUDGEMENT)
    .map(([k, s]) => ({ k, s, margin: s.accuracy - s.majorityBaselineAccuracy }))
    .sort((a, b) => b.margin - a.margin);

  if (Object.keys(input.aiScores).length === 0) {
    hrd.push("Belum ada data penilaian. Nyalakan flag aiShadowPrediction dan isi API key AI agar kinerja bisa dinilai.");
  } else {
    for (const [k, s] of Object.entries(input.aiScores)) {
      const name = SOURCE_NAMES[k] ?? k;
      if (s.scored < MIN_SCORED_FOR_JUDGEMENT) {
        hrd.push(`${name}: baru ${s.scored} prediksi ternilai (butuh ${MIN_SCORED_FOR_JUDGEMENT}) -- belum bisa dinilai.`);
      } else {
        hrd.push(`${name}: akurasi ${pct(s.accuracy)} vs baseline ${pct(s.majorityBaselineAccuracy)} (${s.scored} prediksi) -- ${s.verdict}.`);
      }
    }
    if (ranked.length > 0 && ranked[0].margin > 0) {
      hrd.push(`Paling unggul terhadap baseline: ${SOURCE_NAMES[ranked[0].k] ?? ranked[0].k}.`);
    } else if (ranked.length > 0) {
      hrd.push("Belum ada sumber yang mengalahkan baseline.");
    }
  }
  for (const r of ranked) {
    if (r.s.scored >= 50 && r.margin < -0.05 && r.k !== "llm:consensus") {
      recs.push({
        role: "HRD",
        key: `weak_${r.k}`,
        kind: "note",
        title: `${SOURCE_NAMES[r.k] ?? r.k} di bawah baseline`,
        detail: `Akurasi ${pct(r.s.accuracy)} lebih rendah dari baseline ${pct(r.s.majorityBaselineAccuracy)} pada ${r.s.scored} prediksi. Pertimbangkan menonaktifkan sumber ini (hapus API key di Vercel) untuk menghemat biaya. Keputusan ada pada Anda.`,
      });
    }
  }

  // ---------------- MANAJER: kesehatan operasional ----------------
  const mgr: string[] = [
    `24 jam terakhir: ${errors} error, ${warnings} peringatan, ${trades24.length} transaksi.`,
    `Posisi terbuka: ${input.positions.length} dari batas ${input.settings.maxOpenPositions}.`,
  ];
  if (blocked > 0) mgr.push(`BUY diblokir batas posisi ${blocked} kali.`);
  if (lastLogAgeMinutes !== null) mgr.push(`Log terakhir ${lastLogAgeMinutes} menit lalu.`);

  if (lastLogAgeMinutes === null || lastLogAgeMinutes > 360) {
    recs.push({
      role: "MANAJER",
      key: "no_recent_logs",
      kind: "note",
      title: "Bot tampak tidak aktif",
      detail: "Tidak ada log baru dalam 6 jam. Periksa jadwal cron (cron-job.org) dan status deployment Vercel.",
    });
  }
  if (errors >= 10) {
    recs.push({
      role: "MANAJER",
      key: "many_errors",
      kind: "note",
      title: `${errors} error dalam 24 jam`,
      detail: "Jumlah error tinggi. Periksa Activity Logs dan Vercel runtime logs sebelum menambah risiko.",
    });
  }
  if (blocked >= 5 && input.settings.maxOpenPositions < 3) {
    const next = input.settings.maxOpenPositions + 1;
    recs.push({
      role: "MANAJER",
      key: "raise_max_positions",
      kind: "setting",
      title: `Naikkan Max Open Positions ke ${next}`,
      detail: `BUY diblokir batas posisi ${blocked} kali dalam 24 jam. Menaikkan batas menambah peluang sekaligus eksposur; uji di mode paper dan pastikan portfolioExposureLimit menyala.`,
      patch: { maxOpenPositions: next },
    });
  }

  // ---------------- TRADER: posisi & sikap AI ----------------
  const trader: string[] = [];
  if (input.positions.length === 0) {
    trader.push("Tidak ada posisi terbuka.");
  }
  for (const p of input.positions) {
    let note = "";
    if (p.profitPercent <= -(input.settings.stopLossPercent * 0.8)) note = " -- mendekati stop-loss";
    else if (p.profitPercent >= input.settings.targetProfitPercent * 0.8) note = " -- mendekati target";
    trader.push(`${upper(p.pair)}: ${p.profitPercent.toFixed(2)}% (nilai Rp${Math.round(p.positionValue).toLocaleString("id-ID")})${note}.`);
  }
  const stance = new Map<string, string>();
  for (const l of [...input.logs].sort((a, b) => b.ts - a.ts)) {
    const m = l.message.match(/^\[AI Consensus ([A-Z0-9_]+)\] signal=([A-Z_]+), agreement=(\d+)%/);
    if (m && !stance.has(m[1])) stance.set(m[1], `${m[2]} (kesepakatan ${m[3]}%)`);
  }
  for (const [pair, s] of Array.from(stance.entries()).slice(0, 6)) {
    trader.push(`Konsensus AI ${pair.replace("_", "/")}: ${s}.`);
  }

  // Kinerja 30 hari (perkiraan): pasangkan BUY -> SELL berikutnya per pair+mode.
  const recent = input.trades.filter((t) => t.ts >= input.nowMs - PERIOD_MS).sort((a, b) => a.ts - b.ts);
  const entry = new Map<string, number>();
  const perPair = new Map<string, number[]>();
  for (const t of recent) {
    const k = `${t.pair}|${t.mode}`;
    if (t.type === "BUY") entry.set(k, t.price);
    else if (t.type === "SELL" && entry.has(k) && (entry.get(k) ?? 0) > 0) {
      const ret = (t.price / (entry.get(k) as number) - 1) * 100 - ROUND_TRIP_COST_PCT;
      perPair.set(t.pair, [...(perPair.get(t.pair) ?? []), ret]);
      entry.delete(k);
    }
  }
  const allClosed = Array.from(perPair.values()).flat();
  if (allClosed.length === 0) {
    trader.push("Kinerja 30 hari: belum ada trade yang selesai (BUY lalu SELL).");
  } else {
    const wins = allClosed.filter((x) => x > 0).length;
    const avg = allClosed.reduce((a, b) => a + b, 0) / allClosed.length;
    trader.push(`Kinerja 30 hari (perkiraan, setelah biaya ${ROUND_TRIP_COST_PCT}%): ${allClosed.length} trade selesai, menang ${pct(wins / allClosed.length)}, rata-rata ${avg.toFixed(2)}% per trade.`);
    const rows = Array.from(perPair.entries())
      .map(([p, arr]) => ({ p, n: arr.length, avg: arr.reduce((a, b) => a + b, 0) / arr.length }))
      .sort((a, b) => b.avg - a.avg);
    const best = rows.slice(0, 3).filter((r) => r.avg > 0);
    for (const r of best) trader.push(`Terbaik: ${upper(r.p)} ${r.avg.toFixed(2)}% (${r.n} trade).`);
    for (const r of rows.filter((r) => r.avg < 0 && !best.includes(r)).slice(-2)) trader.push(`Terlemah: ${upper(r.p)} ${r.avg.toFixed(2)}% (${r.n} trade).`);
    if (allClosed.length >= MIN_CLOSED_FOR_EXPANSION && wins / allClosed.length >= WIN_RATE_FOR_EXPANSION && avg > 0) {
      recs.push({
        role: "TRADER",
        key: "expand_watchlist",
        kind: "note",
        title: "Kinerja watchlist membaik -- pertimbangkan perluasan bertahap",
        detail: `${allClosed.length} trade selesai, menang ${pct(wins / allClosed.length)}, rata-rata ${avg.toFixed(2)}% setelah perkiraan biaya. Jika Anda setuju, perluas bertahap (mis. +5 pair per minggu) dengan mematikan flag watchlistOnly, dan pantau durasi siklus (batas cron 30 detik).`,
      });
    }
  }

  // ---------------- PAIR: pair potensial ----------------
  const pair: string[] = [];
  const topQualified = input.scanner.top
    .filter((t) => input.scanner.qualifiedPairs.includes(t.pair))
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 5);
  if (topQualified.length === 0) {
    pair.push("Belum ada pair yang lolos kriteria scanner pada siklus terakhir.");
  }
  for (const t of topQualified) {
    pair.push(`${upper(t.pair)}: skor ${t.opportunityScore.toFixed(0)}, RSI ${t.rsi14.toFixed(0)}, tren ${t.trend}, sinyal ${t.signalRecommendation}.`);
  }
  const wanted = topQualified.slice(0, 3).map((t) => t.pair.toLowerCase());
  const current = input.priorityPairs.map((p) => p.toLowerCase());
  const same = wanted.length === current.length && wanted.every((p) => current.includes(p));
  if (wanted.length > 0 && !same) {
    recs.push({
      role: "PAIR",
      key: "priority_pairs",
      kind: "priority_pairs",
      title: `Fokus ke ${wanted.map(upper).join(", ")}`,
      detail: `Tiga pair lolos scanner dengan skor tertinggi. Menerapkan ini membatasi pair yang diproses bot ke daftar tersebut (plus posisi terbuka).`,
      patch: { priorityPairs: wanted },
    });
  }

  // Perluasan watchlist bertahap: usulan 1 pair per minggu (ISO-week) menuju target.
  pair.push(`Watchlist: ${input.watchlist.length}/${WATCHLIST_TARGET} pair (${input.watchlist.map(upper).join(", ")}).`);
  if (input.watchlist.length < WATCHLIST_TARGET) {
    const inList = new Set(input.watchlist.map((p) => p.toLowerCase()));
    const next = input.scanner.top
      .filter((t) => !inList.has(t.pair.toLowerCase()) && input.scanner.qualifiedPairs.includes(t.pair))
      .sort((a, b) => b.opportunityScore - a.opportunityScore)[0];
    if (next) {
      const week = isoWeekKey(input.nowMs);
      recs.push({
        role: "PAIR",
        key: `watchlist_add_${week}`,
        kind: "watchlist_add",
        title: `Tambah ${upper(next.pair)} ke watchlist (${input.watchlist.length + 1}/${WATCHLIST_TARGET})`,
        detail: `Kandidat terbaik minggu ini di luar watchlist: skor ${next.opportunityScore.toFixed(0)}, RSI ${next.rsi14.toFixed(0)}, tren ${next.trend}. Satu pair per minggu menjaga durasi siklus dan risiko tetap terkendali; setujui hanya bila kinerja watchlist saat ini memuaskan.`,
        patch: { watchlistAdd: next.pair.toLowerCase() },
      });
    } else {
      pair.push("Belum ada kandidat baru di luar watchlist yang lolos scanner minggu ini.");
    }
  }

  const sections: SectionReport[] = [
    { role: "HRD", title: "HRD -- kinerja tim AI", lines: hrd },
    { role: "MANAJER", title: "Manajer -- kesehatan operasional", lines: mgr },
    { role: "TRADER", title: "Trader -- posisi & sikap pasar", lines: trader },
    { role: "PAIR", title: "Analis Pair -- peluang", lines: pair },
  ];

  return {
    sections,
    recommendations: recs,
    stats: {
      errors24h: errors,
      warnings24h: warnings,
      trades24h: trades24.length,
      blockedByPositionLimit24h: blocked,
      lastLogAgeMinutes,
      openPositions: input.positions.length,
    },
  };
}
