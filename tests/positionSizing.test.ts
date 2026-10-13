import test from "node:test";
import assert from "node:assert/strict";
import { PositionSizingEngine } from "../src/services/execution/risk/positionSizing";

const e = new PositionSizingEngine();

test("hitung ukuran posisi dari risiko", () => {
  const r = e.calculate({ accountBalance: 10_000_000, riskPercent: 1, entryPrice: 1000, stopLossPrice: 950 });
  assert.equal(r.riskAmount, 100_000);
  assert.equal(r.riskPerUnit, 50);
  assert.equal(r.quantity, 2000);
});
test("saldo tidak valid ditolak", () => {
  assert.throws(() => e.calculate({ accountBalance: 0, riskPercent: 1, entryPrice: 1, stopLossPrice: 0.5 }));
  assert.throws(() => e.calculate({ accountBalance: -1, riskPercent: 1, entryPrice: 1, stopLossPrice: 0.5 }));
});
test("risiko 0 atau negatif ditolak", () => {
  assert.throws(() => e.calculate({ accountBalance: 1000, riskPercent: 0, entryPrice: 1, stopLossPrice: 0.5 }));
});
