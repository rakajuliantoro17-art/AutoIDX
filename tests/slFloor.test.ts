import test from "node:test";
import assert from "node:assert/strict";
import RiskManager from "../src/services/trading/risk";

// BTC-like: ATR 0,25% -> 1,5 x ATR = 0,375% (di bawah lantai)
const calc = (atrPct: number, sl = 2, tp = 4, fixedTp?: number) =>
  RiskManager.calculateAtrStopLevels(100, atrPct, sl, tp, fixedTp);

test("pair tenang: SL dinaikkan ke lantai Settings (2%), TP = 2 x SL = 4%", () => {
  const r = calc(0.25);
  assert.equal(r.stopLossPercent, 2);
  assert.equal(r.takeProfitPercent, 4);
});

test("sebelum perbaikan pair tenang jadi SL 0,5%/TP 1%: sekarang tidak lagi", () => {
  const r = calc(0.25);
  assert.notEqual(r.stopLossPercent, 0.5);
});

test("pair volatil sedang: SL = 1,5 x ATR (di atas lantai), TP = 2 x SL", () => {
  const r = calc(2.0); // 1,5 x 2,0 = 3,0
  assert.equal(r.stopLossPercent, 3);
  assert.equal(r.takeProfitPercent, 6);
});

test("pair sangat liar: SL tetap dibatasi 8%", () => {
  assert.equal(calc(10).stopLossPercent, 8);
});

test("lantai tidak pernah melebihi batas 8% dan tidak di bawah 0,5%", () => {
  assert.equal(calc(0.25, 20, 40).stopLossPercent, 8);
  assert.equal(calc(0.25, 0.1, 0.2).stopLossPercent, 0.5);
  assert.equal(calc(0.25, NaN, 4).stopLossPercent, 0.5);
});

test("flag fixedTakeProfit tetap mengunci TP; SL tetap memakai lantai", () => {
  const r = calc(0.25, 2, 4, 3);
  assert.equal(r.stopLossPercent, 2);
  assert.equal(r.takeProfitPercent, 3);
});

test("harga SL/TP konsisten dengan persen", () => {
  const r = calc(0.25);
  assert.ok(Math.abs(r.stopLossPrice - 98) < 1e-9);
  assert.ok(Math.abs(r.takeProfitPrice - 104) < 1e-9);
});
