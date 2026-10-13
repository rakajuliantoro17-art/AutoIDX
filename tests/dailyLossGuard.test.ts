import test from "node:test";
import assert from "node:assert/strict";
import { evaluateDailyLoss } from "../src/services/safety/dailyLossGuard";

const base = { maxDailyLossPercent: 3, startingBalance: 1_000_000, live: true };

test("belum rugi -> tidak diblokir", () => {
  const d = evaluateDailyLoss({ ...base, dailyPnlIdr: 0 });
  assert.equal(d.blocked, false);
  assert.equal(d.maxDailyLossIdr, 30_000);
});
test("rugi tepat di batas -> diblokir", () => {
  const d = evaluateDailyLoss({ ...base, dailyPnlIdr: -30_000 });
  assert.equal(d.blocked, true);
  assert.equal(d.reason, "LIMIT_REACHED");
});
test("rugi sedikit di bawah batas -> lolos", () => {
  assert.equal(evaluateDailyLoss({ ...base, dailyPnlIdr: -29_999 }).blocked, false);
});
test("untung tidak pernah memblokir", () => {
  assert.equal(evaluateDailyLoss({ ...base, dailyPnlIdr: 500_000 }).blocked, false);
});
test("LIVE + status tidak terbaca -> diblokir (fail-closed)", () => {
  const d = evaluateDailyLoss({ ...base, dailyPnlIdr: 0, readFailed: true });
  assert.equal(d.blocked, true);
  assert.equal(d.reason, "STATE_UNREADABLE");
});
test("PAPER + status tidak terbaca -> tidak diblokir (tanpa dana nyata)", () => {
  assert.equal(evaluateDailyLoss({ ...base, live: false, dailyPnlIdr: 0, readFailed: true }).blocked, false);
});
test("kunci: batas pernah tercapai hari ini -> tetap diblokir walau P&L pulih di atas batas", () => {
  const d = evaluateDailyLoss({ ...base, dailyPnlIdr: 5_000, latched: true });
  assert.equal(d.blocked, true);
  assert.equal(d.reason, "LIMIT_REACHED");
});
test("tanpa kunci dan P&L di atas batas -> lolos", () => {
  assert.equal(evaluateDailyLoss({ ...base, dailyPnlIdr: -10_000, latched: false }).blocked, false);
});
