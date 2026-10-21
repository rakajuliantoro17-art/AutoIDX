import test from "node:test";
import assert from "node:assert/strict";
import { evaluateCanaryReadiness, type ReadinessInput } from "../src/services/canary/readiness";

const now = 1_800_000_000_000;
const base: ReadinessInput = {
  mode: "live", liveConfirm: true, emergencyStop: false, canaryEnabled: true, canaryOnly: true,
  canaryMaxTradeAmount: 10000, canaryMaxOpenOrders: 1, tradeAmountIdr: 10000, maxOpenPositions: 1,
  maxExposurePercent: 20, absoluteMaxExposurePercent: 50, portfolioExposureLimitOn: false, minOrderValue: 10000,
  idrBalance: 55000, hasActiveAccount: true, reconcile: { consistent: true, checkedAt: now - 60000, mismatchCount: 0 },
  reconcileMaxAgeMs: 15 * 60000, uncertainLocks: 0, openPositions: 0, now,
};
const status = (r: ReturnType<typeof evaluateCanaryReadiness>, id: string) => r.checks.find((x) => x.id === id)?.status;

test("saldo 55.000 siap", () => assert.equal(evaluateCanaryReadiness(base).ready, true));

test("saldo 19.926 gagal di exposure dan menyebut saldo minimal 50.000", () => {
  const r = evaluateCanaryReadiness({ ...base, idrBalance: 19926 });
  assert.equal(r.ready, false);
  assert.equal(status(r, "exposure"), "fail");
  assert.match(r.checks.find((x) => x.id === "exposure")!.detail, /50\.000/);
});

test("flag exposure total aktif: 10.000 dari 19.926 (50,2%) gagal", () => {
  const r = evaluateCanaryReadiness({ ...base, idrBalance: 19926, portfolioExposureLimitOn: true });
  assert.equal(status(r, "exposureTotal"), "fail");
});

test("rekonsiliasi basi atau mismatch gagal", () => {
  assert.equal(status(evaluateCanaryReadiness({ ...base, reconcile: { consistent: true, checkedAt: now - 20 * 60000, mismatchCount: 0 } }), "reconcile"), "fail");
  assert.equal(status(evaluateCanaryReadiness({ ...base, reconcile: { consistent: false, checkedAt: now, mismatchCount: 2 } }), "reconcile"), "fail");
  assert.equal(status(evaluateCanaryReadiness({ ...base, reconcile: null }), "reconcile"), "fail");
});

test("canary belum aktif, emergency stop, order tak pasti gagal; paper hanya peringatan", () => {
  const r = evaluateCanaryReadiness({ ...base, canaryEnabled: false, emergencyStop: true, uncertainLocks: 1, mode: "paper" });
  assert.equal(r.ready, false);
  assert.equal(status(r, "canaryEnabled"), "fail");
  assert.equal(status(r, "emergency"), "fail");
  assert.equal(status(r, "locks"), "fail");
  assert.equal(status(r, "mode"), "warn");
});

test("gagal baca saldo = gagal (fail-closed)", () => {
  assert.equal(evaluateCanaryReadiness({ ...base, idrBalance: null, balanceError: "403" }).ready, false);
});
