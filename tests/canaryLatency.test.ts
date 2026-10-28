import test from "node:test";
import assert from "node:assert/strict";
import CanaryMetrics, { resolveMaxAverageLatencyMs } from "../src/services/liveTrading/monitoring/canaryMetrics";

const order = (i: number, latencyMs: number) => ({
  orderId: `o${i}`, symbol: "btc_idr", side: "BUY" as const, amount: 15000, price: 1,
  status: "FILLED" as const, latencyMs, timestamp: 1_000 + i,
});

test("resolveMaxAverageLatencyMs: default 8000, env valid dipakai, tak valid -> default", () => {
  assert.equal(resolveMaxAverageLatencyMs(undefined), 8000);
  assert.equal(resolveMaxAverageLatencyMs(""), 8000);
  assert.equal(resolveMaxAverageLatencyMs("abc"), 8000);
  assert.equal(resolveMaxAverageLatencyMs("100"), 8000);
  assert.equal(resolveMaxAverageLatencyMs("6000"), 6000);
});

test("latensi dasar ~4,7 dtk dengan 5 order tidak CRITICAL; insiden 74.645 ms tetap CRITICAL", () => {
  const ok = new CanaryMetrics();
  [4500, 4600, 4700, 4800, 6300].forEach((l, i) => ok.recordOrder(order(i, l)));
  assert.notEqual(ok.getSnapshot().status, "CRITICAL");

  const bad = new CanaryMetrics();
  [4000, 4100, 4200, 4300, 74645 * 5].forEach((l, i) => bad.recordOrder(order(i, l)));
  assert.equal(bad.getSnapshot().status, "CRITICAL");
});
