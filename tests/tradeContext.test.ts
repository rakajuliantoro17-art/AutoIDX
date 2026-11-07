import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildEntryContext, buildExitContext } from "../src/services/trading/tradeContext";

test("entry context: ATR% dari atr/harga, pembulatan 2 desimal", () => {
  const c = buildEntryContext({ entryPrice: 100, atr: 5.333, rsi: 61.234, slPercent: 8, tpPercent: 3, nowMs: 1000 });
  assert.deepEqual(c, { atrPercent: 5.33, slPercent: 8, tpPercent: 3, rsi: 61.23, enteredAtMs: 1000 });
});

test("entry context: input tak valid tidak melempar", () => {
  const c = buildEntryContext({ entryPrice: 0, atr: NaN, rsi: NaN, slPercent: NaN, tpPercent: NaN, nowMs: 5 });
  assert.equal(c.atrPercent, 0);
  assert.equal(c.rsi, 0);
});

test("exit context UAI: STOP_LOSS, pnl -9.35%, lama ditahan", () => {
  const x = buildExitContext({
    exitReason: "STOP_LOSS", entryPrice: 1.828, exitPrice: 1.657, nowMs: 1_000_000 + 7 * 3600_000,
    entryContext: { atrPercent: 5.4, slPercent: 8, tpPercent: 3, rsi: 58, enteredAtMs: 1_000_000 },
  });
  assert.equal(x.exitReason, "STOP_LOSS");
  assert.equal(x.pnlPercent, -9.35);
  assert.equal(x.heldMinutes, 420);
  assert.equal(x.entry_slPercent, 8);
  assert.equal(x.entry_rsi, 58);
});

test("exit context tanpa entryContext (posisi lama): tetap ada alasan dan pnl", () => {
  const x = buildExitContext({ exitReason: "SIGNAL", entryPrice: 10, exitPrice: 11, nowMs: 1, entryContext: undefined });
  assert.deepEqual(x, { exitReason: "SIGNAL", pnlPercent: 10 });
});

test("engine: kedua SELL mengirim context dan exit membersihkan entryContext", () => {
  const src = readFileSync("src/services/trading/engine.ts", "utf8");
  assert.equal((src.match(/context: buildExitContext\(/g) ?? []).length, 2);
  assert.equal((src.match(/entryContext: null/g) ?? []).length, 2);
  assert.match(src, /entryContext: buildEntryContext\(/);
});
