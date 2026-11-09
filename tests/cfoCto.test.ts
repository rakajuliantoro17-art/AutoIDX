import test from "node:test";
import assert from "node:assert/strict";
import { analyzeOps } from "../src/services/agents/analysis";
import type { OpsInput } from "../src/services/agents/types";

const NOW = Date.UTC(2026, 10, 7, 3, 0, 0);
const base = (over: Partial<OpsInput> = {}): OpsInput => ({
  nowMs: NOW,
  logs: [],
  trades: [],
  positions: [],
  settings: { maxOpenPositions: 3, stopLossPercent: 8, targetProfitPercent: 3 },
  scanner: { qualifiedPairs: [], top: [] },
  priorityPairs: [],
  watchlist: ["btc_idr"],
  aiScores: {},
  ...over,
});
const fin = (totalPnlIdr: number, maxLossIdr = 3000) => ({
  totalPnlIdr, maxLossIdr, canaryStatus: "HEALTHY", totalOrders: 10, failedOrders: 0, avgLatencyMs: 4200, maxLatencyMs: 6000,
});
const roleRecs = (r: ReturnType<typeof analyzeOps>, role: string) => r.recommendations.filter((x) => x.role === role);

test("laporan memuat bagian CFO dan CTO", () => {
  const r = analyzeOps(base());
  const roles = r.sections.map((s) => s.role);
  assert.ok(roles.includes("CFO") && roles.includes("CTO"));
});

test("CFO: rugi >=70% batas -> satu usulan note, tidak mengubah setting", () => {
  const r = analyzeOps(base({ finance: fin(-2200) }));
  const c = roleRecs(r, "CFO");
  assert.equal(c.length, 1);
  assert.equal(c[0].kind, "note");
  assert.equal(c[0].patch, undefined);
  assert.match(r.sections.find((s) => s.role === "CFO")!.lines.join(" "), /73%/);
});

test("CFO: rugi kecil -> tanpa usulan", () => {
  assert.equal(roleRecs(analyzeOps(base({ finance: fin(-500) })), "CFO").length, 0);
});

test("CFO: SL overshoot terdeteksi (UAI -9,35% vs SL 8%)", () => {
  const trades = [
    { pair: "uai_idr", type: "BUY", mode: "live", price: 1.828, totalIdr: 15000, ts: NOW - 7200_000 },
    { pair: "uai_idr", type: "SELL", mode: "live", price: 1.657, totalIdr: 13600, ts: NOW - 3600_000 },
  ];
  const r = analyzeOps(base({ trades, finance: fin(0) }));
  const c = roleRecs(r, "CFO");
  assert.equal(c.length, 1);
  assert.equal(c[0].key, "sl_overshoot");
  assert.match(r.sections.find((s) => s.role === "CFO")!.lines.join(" "), /UAI\/IDR -9\.35%/);
});

test("CFO: maksimal satu usulan per hari walau dua kondisi terpenuhi", () => {
  const trades = [
    { pair: "uai_idr", type: "BUY", mode: "live", price: 1.828, totalIdr: 15000, ts: NOW - 7200_000 },
    { pair: "uai_idr", type: "SELL", mode: "live", price: 1.657, totalIdr: 13600, ts: NOW - 3600_000 },
  ];
  assert.equal(roleRecs(analyzeOps(base({ trades, finance: fin(-2900) })), "CFO").length, 1);
});

test("CTO: heartbeat > 25 menit -> usulan cron mati", () => {
  const r = analyzeOps(base({ infra: { heartbeatAgeMs: 40 * 60_000, lastScanDurationMs: 9000, lastScanReads: 100 } }));
  const c = roleRecs(r, "CTO");
  assert.equal(c.length, 1);
  assert.equal(c[0].key, "cron_dead");
});

test("CTO: heartbeat 10 menit (cron normal) -> tidak ada alarm palsu", () => {
  const r = analyzeOps(base({ infra: { heartbeatAgeMs: 10 * 60_000, lastScanDurationMs: 9000, lastScanReads: 100 } }));
  assert.equal(roleRecs(r, "CTO").length, 0);
});

test("CTO: proyeksi baca >=60% kuota -> usulan reads_high", () => {
  // 144 siklus/hari x 250 = 36.000 = 72%
  const r = analyzeOps(base({ infra: { heartbeatAgeMs: 60_000, lastScanDurationMs: 9000, lastScanReads: 250 } }));
  const c = roleRecs(r, "CTO");
  assert.equal(c.length, 1);
  assert.equal(c[0].key, "reads_high");
});

test("tanpa data finance/infra: tidak error, ada catatan", () => {
  const r = analyzeOps(base());
  assert.match(r.sections.find((s) => s.role === "CFO")!.lines.join(" "), /belum tersedia/);
  assert.match(r.sections.find((s) => s.role === "CTO")!.lines.join(" "), /belum tersedia/);
  assert.equal(roleRecs(r, "CFO").length + roleRecs(r, "CTO").length, 0);
});

import { buildNotifications, exitContextText } from "../src/services/notifications/feed";
test("notifikasi SELL memuat alasan exit dari ctx; tanpa ctx tetap seperti semula", () => {
  const mk = (ctx?: Record<string, unknown>) => buildNotifications({
    trades: [
      { id: "b", pair: "btc_idr", type: "BUY", mode: "live", price: 1374196511, totalIdr: 15000, ts: 1 },
      { id: "s", pair: "btc_idr", type: "SELL", mode: "live", price: 1360238751, totalIdr: 15000, ts: 2, ctx },
    ], audits: [], emergencyLogs: [], pendingRecs: [],
  }).find((n) => n.id === "t_s")!;
  assert.match(mk().title, /Rugi -1\.02% BTC\/IDR/);
  assert.doesNotMatch(mk().detail, /Alasan/);
  const d = mk({ exitReason: "STOP_LOSS", heldMinutes: 300, pnlPercent: -0.61, entry_slPercent: 1, entry_tpPercent: 2 }).detail;
  assert.match(d, /Alasan: kena Stop Loss, ditahan 5 jam, harga saat pemicu -0\.61%, SL 1% \/ TP 2% saat entry\./);
  assert.equal(exitContextText(undefined), "");
});
