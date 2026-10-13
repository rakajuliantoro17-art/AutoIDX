import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateOrderBreaker, afterOrderFailure, afterOrderSuccess, DEFAULT_ORDER_BREAKER as C,
} from "../src/services/safety/orderBreaker";

const fresh = { consecutiveFailures: 0, lastFailureAtMs: 0 };

test("tanpa kegagalan -> CLOSED, order diizinkan", () => {
  assert.deepEqual(evaluateOrderBreaker(fresh, 1000), { allow: true, mode: "CLOSED" });
});
test("2 kegagalan (di bawah ambang 3) -> masih diizinkan", () => {
  let s = afterOrderFailure(afterOrderFailure(fresh, 1000), 2000);
  assert.equal(evaluateOrderBreaker(s, 3000).allow, true);
});
test("3 kegagalan beruntun -> OPEN, order diblokir dengan sisa waktu", () => {
  let s = fresh;
  for (const t of [1000, 2000, 3000]) s = afterOrderFailure(s, t);
  const d = evaluateOrderBreaker(s, 4000);
  assert.equal(d.allow, false);
  if (!d.allow) assert.equal(d.retryInMs, C.cooldownMs - 1000);
});
test("setelah cooldown -> HALF_OPEN (satu percobaan)", () => {
  let s = fresh;
  for (const t of [1000, 2000, 3000]) s = afterOrderFailure(s, t);
  const d = evaluateOrderBreaker(s, 3000 + C.cooldownMs);
  assert.deepEqual(d, { allow: true, mode: "HALF_OPEN" });
});
test("percobaan half-open gagal -> OPEN lagi dengan cooldown baru", () => {
  let s = fresh;
  for (const t of [1000, 2000, 3000]) s = afterOrderFailure(s, t);
  const t4 = 3000 + C.cooldownMs;
  s = afterOrderFailure(s, t4);
  assert.equal(evaluateOrderBreaker(s, t4 + 1000).allow, false);
});
test("sukses mereset hitungan", () => {
  assert.deepEqual(afterOrderSuccess(), fresh);
  assert.equal(evaluateOrderBreaker(afterOrderSuccess(), 5).allow, true);
});
test("konfigurasi kustom dihormati", () => {
  const cfg = { failureThreshold: 1, cooldownMs: 100 };
  const s = afterOrderFailure(fresh, 0);
  assert.equal(evaluateOrderBreaker(s, 50, cfg).allow, false);
  assert.equal(evaluateOrderBreaker(s, 100, cfg).allow, true);
});
