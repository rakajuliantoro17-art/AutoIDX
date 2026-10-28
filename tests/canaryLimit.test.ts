import test from "node:test";
import assert from "node:assert/strict";
import { resolveCanaryPositionLimit } from "../src/services/trading/canaryLimit";

test("gerbang canary mengikuti Settings Max Open Position", () => {
  assert.equal(resolveCanaryPositionLimit(3, 1), 3);
  assert.equal(resolveCanaryPositionLimit(2, 5), 2);
  assert.equal(resolveCanaryPositionLimit(2.9, 1), 2);
});

test("Settings tidak valid -> jatuh ke env (fail-safe)", () => {
  assert.equal(resolveCanaryPositionLimit(undefined, 1), 1);
  assert.equal(resolveCanaryPositionLimit(0, 1), 1);
  assert.equal(resolveCanaryPositionLimit(Number.NaN, 2), 2);
});
