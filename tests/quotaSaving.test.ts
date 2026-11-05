import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getCached, setCached, invalidateCached, clearAllCached } from "../src/services/firebase/ttlCache";
import { pairsForStopState } from "../src/services/scheduler/cron";
import { getScanMinIntervalMs } from "../src/services/scheduler/cronLock";

test("ttlCache: hit sebelum TTL, kedaluwarsa sesudahnya, invalidate menghapus", () => {
  clearAllCached();
  setCached("k", 42, 1000);
  assert.equal(getCached<number>("k", 500, 1400), 42);
  assert.equal(getCached<number>("k", 500, 1600), undefined);
  setCached("k", 1, 2000);
  invalidateCached("k");
  assert.equal(getCached<number>("k", 500, 2100), undefined);
});

test("emergency stop: hanya pair berposisi terbuka yang diproses", () => {
  const open = new Set(["dot_idr"]);
  assert.deepEqual(pairsForStopState(["btc_idr", "dot_idr", "eth_idr"], open, true), ["dot_idr"]);
  assert.deepEqual(pairsForStopState(["btc_idr", "dot_idr"], open, false), ["btc_idr", "dot_idr"]);
  assert.deepEqual(pairsForStopState(["btc_idr"], new Set(), true), []);
});

test("interval minimum scan default 120 dtk, env tetap berlaku", () => {
  const prev = process.env.CRON_SCAN_MIN_INTERVAL_SECONDS;
  delete process.env.CRON_SCAN_MIN_INTERVAL_SECONDS;
  assert.equal(getScanMinIntervalMs(), 120_000);
  process.env.CRON_SCAN_MIN_INTERVAL_SECONDS = "60";
  assert.equal(getScanMinIntervalMs(), 60_000);
  if (prev === undefined) delete process.env.CRON_SCAN_MIN_INTERVAL_SECONDS;
  else process.env.CRON_SCAN_MIN_INTERVAL_SECONDS = prev;
});

test("jalur tulis risk state membaca fresh; cache tidak menyimpan kegagalan", () => {
  const risk = readFileSync("src/services/firebase/riskState.ts", "utf8");
  assert.match(risk, /getRiskState\(\{ fresh: true \}\)/);
  const ctl = readFileSync("src/services/firebase/botControl.ts", "utf8");
  assert.match(ctl, /invalidateCached\(CONTROL_CACHE_KEY\)/);
  // fallback gagal-baca (emergencyStop:true) tidak boleh di-cache
  const catchPart = ctl.slice(ctl.indexOf("[BOT CONTROL GET ERROR]"));
  assert.doesNotMatch(catchPart.slice(0, 600), /setCached/);
});
