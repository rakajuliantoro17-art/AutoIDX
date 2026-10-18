import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  shouldWriteLog,
  advisoryKey,
  resetAdvisoryThrottle,
  ADVISORY_LOG_INTERVAL_MS,
  DUPLICATE_LOG_WINDOW_MS,
} from "../src/services/firebase/advisoryLogThrottle";

beforeEach(() => resetAdvisoryThrottle());

const ml = "[ML Advisory BTC_IDR] label=up, confidence=60%";
const tv = "[Trend+Volume Advisory BTC_IDR] TrendRule: score=1";

test("advisory pertama selalu ditulis, berikutnya dalam jendela ditahan", () => {
  assert.equal(shouldWriteLog("info", ml, 1000), true);
  assert.equal(shouldWriteLog("info", ml, 1000 + 60_000), false);
  assert.equal(shouldWriteLog("info", ml, 1000 + ADVISORY_LOG_INTERVAL_MS), true);
});

test("per pair dan per jenis dihitung terpisah", () => {
  assert.equal(shouldWriteLog("info", ml, 0), true);
  assert.equal(shouldWriteLog("info", tv, 0), true);
  assert.equal(shouldWriteLog("info", ml.replace("BTC_IDR", "ETH_IDR"), 0), true);
  assert.equal(shouldWriteLog("info", ml, 1), false);
});

test("warning/danger/error TIDAK PERNAH ditahan, walau teks identik", () => {
  for (let i = 0; i < 5; i++) {
    assert.equal(shouldWriteLog("danger", ml, i), true);
    assert.equal(shouldWriteLog("warning", "Trading Engine (btc_idr): gagal", i), true);
    assert.equal(shouldWriteLog("error", "x", i), true);
  }
});

test("info/success identik persis ditekan dalam jendela, lalu lolos lagi", () => {
  const m = "Cron execution started (btc_idr).";
  assert.equal(shouldWriteLog("info", m, 0), true);
  assert.equal(shouldWriteLog("info", m, 60_000), false);
  assert.equal(shouldWriteLog("info", m, DUPLICATE_LOG_WINDOW_MS), true);
});

test("teks berbeda, pair berbeda, atau tipe berbeda TIDAK ditekan", () => {
  assert.equal(shouldWriteLog("info", "Cron execution started (btc_idr).", 0), true);
  assert.equal(shouldWriteLog("info", "Cron execution started (eth_idr).", 1), true);
  assert.equal(shouldWriteLog("success", "Cron execution started (btc_idr).", 2), true);
  assert.equal(shouldWriteLog("info", "[Paper] BUY btc_idr @ 1000", 3), true);
  assert.equal(shouldWriteLog("info", "[Paper] BUY btc_idr @ 1001", 4), true);
});

test("advisoryKey hanya mengenali dua prefix advisory", () => {
  assert.equal(advisoryKey(ml), "ML Advisory|BTC_IDR");
  assert.equal(advisoryKey("[AI Consensus BTC_IDR] x"), "AI Consensus|BTC_IDR");
  assert.equal(advisoryKey("[Effective Config ETH_IDR] x"), "Effective Config|ETH_IDR");
  assert.equal(advisoryKey("[Trailing Stop BTC_IDR] naik"), null);
  assert.equal(advisoryKey("[EXPOSURE TOTAL] BUY diblokir"), null);
  assert.equal(advisoryKey("halo"), null);
});
