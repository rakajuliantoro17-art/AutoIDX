import test from "node:test";
import assert from "node:assert/strict";
import { analyzeOps } from "../src/services/agents/analysis";
import type { OpsInput } from "../src/services/agents/types";

const base = (top: { pair: string; trend: string; score: number }[]): OpsInput => ({
  nowMs: Date.UTC(2026, 10, 6, 3, 0, 0),
  logs: [],
  trades: [],
  positions: [],
  settings: { maxOpenPositions: 3, stopLossPercent: 2, targetProfitPercent: 2 },
  scanner: {
    qualifiedPairs: top.map((t) => t.pair),
    top: top.map((t) => ({ pair: t.pair, opportunityScore: t.score, rsi14: 50, trend: t.trend, volIdr: 1e9, signalRecommendation: "BUY" })),
  },
  priorityPairs: [],
  watchlist: ["btc_idr", "eth_idr"],
  aiScores: {},
});

test("usulan watchlist_add hanya memilih kandidat BULLISH, walau skor lebih rendah", () => {
  const r = analyzeOps(
    base([
      { pair: "aaa_idr", trend: "SIDEWAYS", score: 90 },
      { pair: "bbb_idr", trend: "BULLISH", score: 70 },
      { pair: "ccc_idr", trend: "BEARISH", score: 80 },
    ])
  );
  const add = r.recommendations.find((x) => x.kind === "watchlist_add");
  assert.ok(add);
  assert.equal((add!.patch as { watchlistAdd: string }).watchlistAdd, "bbb_idr");
});

test("tanpa kandidat BULLISH: tidak ada usulan, ada catatan", () => {
  const r = analyzeOps(base([{ pair: "aaa_idr", trend: "SIDEWAYS", score: 90 }]));
  assert.equal(r.recommendations.find((x) => x.kind === "watchlist_add"), undefined);
  const lines = r.sections.find((s) => s.role === "PAIR")!.lines.join(" ");
  assert.match(lines, /tidak ada yang tren BULLISH/);
});
