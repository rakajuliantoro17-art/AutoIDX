import test from "node:test";
import assert from "node:assert/strict";
import {
BelowMinimumOrderError, checkSellableAtStop, isBelowMinOrderValue, isMinOrderError, valueAtStopIdr,
} from "../src/services/trading/minOrder";

test("Rp10.000 dengan SL 3% tidak lolos", () => {
  assert.equal(checkSellableAtStop(10_000, 3).ok, false);
});
test("Rp15.000 dengan SL 3% lolos", () => {
  const r = checkSellableAtStop(15_000, 3);
  assert.equal(r.ok, true);
  assert.ok(r.valueAtStopIdr > 10_500);
});
test("minTradeAmount konsisten dengan ok", () => {
  const r = checkSellableAtStop(10_000, 3);
  assert.equal(checkSellableAtStop(r.minTradeAmountIdr, 3).ok, true);
  assert.equal(checkSellableAtStop(r.minTradeAmountIdr - 200, 3).ok, false);
});
test("valueAtStop memperhitungkan fee dan SL", () => {
  assert.ok(Math.abs(valueAtStopIdr(10_000, 0) - 9_950) < 1e-6);
});
test("deteksi nilai di bawah minimum (ADA kasus nyata)", () => {
  assert.equal(isBelowMinOrderValue(2.54566326, 3857), true);
  assert.equal(isBelowMinOrderValue(2.54566326, 3930), false);
  assert.equal(isBelowMinOrderValue(0, 3857), false);
});
test("deteksi pesan error Indodax", () => {
  assert.equal(isMinOrderError("Minimum order 2.59268861 ADA"), true);
  assert.equal(isMinOrderError("Rejected"), false);
  assert.equal(isMinOrderError(undefined), false);
});
test("error typed", () => {
  const e = new BelowMinimumOrderError("ada_idr", 9800);
  assert.ok(e instanceof Error);
  assert.equal(e.pair, "ada_idr");
});
