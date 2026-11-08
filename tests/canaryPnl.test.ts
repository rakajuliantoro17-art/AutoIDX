import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { estimateRealizedPnlIdr } from "../src/services/trading/pnlEstimate";
import { resolveMaxLossIdr, CanaryMetrics } from "../src/services/liveTrading/monitoring/canaryMetrics";

test("PnL: harga naik 2% menghasilkan untung kecil setelah fee; turun 10% menghasilkan rugi ~Rp1,5-1,6k pada Rp15k", () => {
  const amount = 14968 / 100; // koin kasar, harga entry 100
  const up = estimateRealizedPnlIdr({ entryPrice: 100, exitPrice: 102, amount })!;
  assert.ok(up > 0 && up < 14968 * 0.02);
  const down = estimateRealizedPnlIdr({ entryPrice: 100, exitPrice: 90, amount })!;
  assert.ok(down < -1400 && down > -1800, String(down));
});

test("PnL: input tidak valid -> undefined (tidak merusak pencatatan)", () => {
  assert.equal(estimateRealizedPnlIdr({ entryPrice: 0, exitPrice: 1, amount: 1 }), undefined);
  assert.equal(estimateRealizedPnlIdr({ entryPrice: 1, exitPrice: NaN, amount: 1 }), undefined);
});

test("maxLoss: default 3000, env valid dipakai, nol/negatif/rusak jatuh ke 3000", () => {
  assert.equal(resolveMaxLossIdr(undefined), 3000);
  assert.equal(resolveMaxLossIdr("5000"), 5000);
  for (const bad of ["0", "-5", "abc", ""]) assert.equal(resolveMaxLossIdr(bad), 3000);
});

test("canary: rugi kecil tidak CRITICAL, rugi kumulatif melewati batas CRITICAL", () => {
  const m = new CanaryMetrics({ maxLoss: 3000, minimumSampleSize: 1, maxDrawdown: 10 });
  m.recordOrder({ orderId: "a", symbol: "x_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 1, pnl: -1500 });
  assert.notEqual(m.getSnapshot().status, "CRITICAL");
  m.recordOrder({ orderId: "b", symbol: "y_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 2, pnl: -1600 });
  assert.equal(m.getSnapshot().status, "CRITICAL");
});

test("live.sell mengirim pnl ke canary dan engine meneruskan entryPrice", () => {
  const live = readFileSync("src/services/trading/live.ts", "utf8");
  assert.match(live, /estimateRealizedPnlIdr\(/);
  assert.match(live, /\.\.\.\(pnl !== undefined \? \{ pnl \} : \{\}\)/);
  const eng = readFileSync("src/services/trading/engine.ts", "utf8");
  assert.equal((eng.match(/tradingService\.sell\(\{[^}]*entryPrice: state\.entryPrice/g) ?? []).length, 2);
});

test("drawdown pakai modal acuan: untung Rp326 lalu rugi Rp897 TIDAK CRITICAL (19% batas rugi)", () => {
  const m = new CanaryMetrics({ maxLoss: 3000, minimumSampleSize: 1, capitalBase: 100_000 });
  m.recordOrder({ orderId: "a", symbol: "x_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 1, pnl: 326 });
  m.recordOrder({ orderId: "b", symbol: "y_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 2, pnl: -897 });
  const snap = m.getSnapshot();
  assert.equal(snap.totalPnl, -571);
  assert.ok(snap.drawdown < 0.03, `drawdown ${snap.drawdown}`);
  assert.notEqual(snap.status, "CRITICAL");
});

test("tanpa modal acuan perilaku lama: kasus yang sama CRITICAL (bukti bug)", () => {
  const m = new CanaryMetrics({ maxLoss: 3000, minimumSampleSize: 1, capitalBase: 0 });
  m.recordOrder({ orderId: "a", symbol: "x_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 1, pnl: 326 });
  m.recordOrder({ orderId: "b", symbol: "y_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 2, pnl: -897 });
  assert.equal(m.getSnapshot().status, "CRITICAL");
});

test("drawdown tetap memicu CRITICAL bila rugi dari puncak melebihi 3% modal acuan", () => {
  const m = new CanaryMetrics({ maxLoss: 100_000, minimumSampleSize: 1, capitalBase: 100_000 });
  m.recordOrder({ orderId: "a", symbol: "x_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 1, pnl: 500 });
  m.recordOrder({ orderId: "b", symbol: "y_idr", side: "SELL", amount: 1, status: "FILLED", latencyMs: 1000, timestamp: 2, pnl: -3600 });
  assert.equal(m.getSnapshot().status, "CRITICAL");
});
