import { test } from "node:test";
import assert from "node:assert/strict";
import {
  shouldWriteLog,
  isSampleTurn,
  routinePair,
  SAMPLE_BUCKET_MS,
  SAMPLE_EVERY,
} from "../src/services/firebase/advisoryLogThrottle";

const pairs = ["btc_idr", "eth_idr", "xrp_idr", "doge_idr", "sol_idr", "ada_idr", "bnb_idr", "trx_idr", "ltc_idr", "dot_idr"];

test("routinePair mengenali log rutin per pair saja", () => {
  assert.equal(routinePair("[Confidence Info BTC_IDR] HIGH (80)"), "btc_idr");
  assert.equal(routinePair("[ML Advisory ETH_IDR] label=up"), "eth_idr");
  assert.equal(routinePair("[Trend+Volume Advisory XRP_IDR] x"), "xrp_idr");
  assert.equal(routinePair("Cron execution started (btc_idr)."), "btc_idr");
  assert.equal(routinePair("HOLD BTC_IDR"), "btc_idr");
  // BUKAN rutin: harus selalu ditulis
  assert.equal(routinePair("[PAPER] BUY BTC_IDR @ 1000"), null);
  assert.equal(routinePair("[PAPER] SELL BTC_IDR @ 1000"), null);
  assert.equal(routinePair("[Sanity Check 1 - Konsensus BTC_IDR] x"), null);
  assert.equal(routinePair("[Trailing Stop BTC_IDR] naik"), null);
  assert.equal(routinePair("[EXPOSURE TOTAL] BUY BTC_IDR diblokir"), null);
  assert.equal(routinePair("Cron memproses 10 pair (...)"), null);
  assert.equal(routinePair("HOLD BTC_IDR karena sesuatu"), null);
});

test("warning/danger/error TIDAK PERNAH disampling", () => {
  for (const t of ["warning", "danger", "error"]) {
    for (let i = 0; i < 50; i++) {
      assert.equal(shouldWriteLog(t, "[Confidence Info BTC_IDR] x", i * SAMPLE_BUCKET_MS), true);
    }
  }
});

test("log non-rutin info/success SELALU ditulis", () => {
  for (let i = 0; i < 50; i++) {
    const now = i * SAMPLE_BUCKET_MS;
    assert.equal(shouldWriteLog("success", "[PAPER] BUY BTC_IDR @ 1000", now), true);
    assert.equal(shouldWriteLog("info", "Cron memproses 10 pair", now), true);
  }
});

test("tiap pair menulis tepat 1 dari SAMPLE_EVERY jendela (per jam)", () => {
  for (const p of pairs) {
    let n = 0;
    for (let b = 0; b < SAMPLE_EVERY * 10; b++) {
      if (isSampleTurn(p, b * SAMPLE_BUCKET_MS + 5_000)) n++;
    }
    assert.equal(n, 10, `${p}: 1 dari ${SAMPLE_EVERY} jendela`);
  }
});

test("beban tersebar: tiap siklus hanya sebagian kecil pair yang menulis", () => {
  let total = 0;
  const cycles = 60;
  for (let b = 0; b < cycles; b++) {
    for (const p of pairs) if (isSampleTurn(p, b * SAMPLE_BUCKET_MS + 1000)) total++;
  }
  // rata-rata ~10/6 pair per siklus, bukan 10
  assert.ok(total / cycles < 4, `rata-rata ${total / cycles} pair/siklus`);
  assert.ok(total / cycles > 0.5);
});

test("tanpa state: hasil sama untuk panggilan berulang di jendela yang sama", () => {
  const now = 123 * SAMPLE_BUCKET_MS + 1;
  const a = shouldWriteLog("info", "HOLD BTC_IDR", now);
  for (let i = 0; i < 5; i++) assert.equal(shouldWriteLog("info", "HOLD BTC_IDR", now + i), a);
});
