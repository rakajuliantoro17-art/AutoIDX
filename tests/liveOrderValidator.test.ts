import test from "node:test";
import assert from "node:assert/strict";
import { validateLiveOrder, INDODAX_MIN_ORDER_IDR, PAIR_PATTERN } from "../src/services/trading/liveOrderValidator";

test("order valid lolos", () => {
  assert.equal(validateLiveOrder({ pair: "btc_idr", tradeAmountIdr: 100_000 }).valid, true);
});
test("nominal tepat minimum lolos, di bawahnya ditolak", () => {
  assert.equal(validateLiveOrder({ pair: "xrp_idr", tradeAmountIdr: INDODAX_MIN_ORDER_IDR }).valid, true);
  assert.equal(validateLiveOrder({ pair: "xrp_idr", tradeAmountIdr: INDODAX_MIN_ORDER_IDR - 1 }).valid, false);
});
test("pair salah format ditolak", () => {
  for (const pair of ["BTC_IDR", "btcidr", "btc_usdt", "", "btc_idr ", "../x_idr"]) {
    assert.equal(validateLiveOrder({ pair, tradeAmountIdr: 100_000 }).valid, false, pair);
  }
});
test("nominal bukan angka / negatif / NaN ditolak", () => {
  for (const v of [NaN, -5, 0]) {
    assert.equal(validateLiveOrder({ pair: "btc_idr", tradeAmountIdr: v }).valid, false, String(v));
  }
  assert.equal(
    validateLiveOrder({ pair: "btc_idr", tradeAmountIdr: "100000" as unknown as number }).valid,
    false,
  );
});
test("pola pair", () => {
  assert.ok(PAIR_PATTERN.test("doge_idr"));
  assert.ok(!PAIR_PATTERN.test("doge_idr\n"));
});
