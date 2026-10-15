import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  shouldWriteLog,
  advisoryKey,
  resetAdvisoryThrottle,
  ADVISORY_LOG_INTERVAL_MS,
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

test("log non-advisory dan non-info TIDAK PERNAH ditahan", () => {
  for (let i = 0; i < 5; i++) {
    assert.equal(shouldWriteLog("info", "[Paper] BUY btc_idr", i), true);
    assert.equal(shouldWriteLog("danger", ml, i), true);
    assert.equal(shouldWriteLog("warning", ml, i), true);
  }
});

test("advisoryKey hanya mengenali dua prefix advisory", () => {
  assert.equal(advisoryKey(ml), "ML Advisory|BTC_IDR");
  assert.equal(advisoryKey("[AI Advisory BTC_IDR] x"), null);
  assert.equal(advisoryKey("halo"), null);
});
