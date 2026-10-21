import test from "node:test";
import assert from "node:assert/strict";
import { selectCyclePairs } from "../src/services/scheduler/pairSelection";
import { isStablecoinPair } from "../src/services/scanner/stablecoins";

const base = {
  candidatePairs: ["sol_idr", "usdt_idr", "doge_idr"],
  openPositionPairs: ["btc_idr"],
  watchlist: ["btc_idr", "eth_idr"],
  priorityPairs: ["sol_idr", "usdt_idr"],
  scannerExecution: false,
  watchlistOnly: true,
};

test("checklist TIDAK membuka gerbang: scannerExecution mati -> hanya watchlist + posisi terbuka", () => {
  const r = selectCyclePairs(base);
  assert.deepEqual(r.pairs.sort(), ["btc_idr", "eth_idr"]);
  assert.equal(r.priorityIgnored, true);
});

test("watchlistOnly menyala menahan kandidat walau scannerExecution nyala", () => {
  const r = selectCyclePairs({ ...base, scannerExecution: true, watchlistOnly: true });
  assert.ok(!r.pairs.includes("sol_idr"));
});

test("gerbang terbuka + checklist: hanya yang dicentang + posisi terbuka, watchlist tidak ikut", () => {
  const r = selectCyclePairs({ ...base, scannerExecution: true, watchlistOnly: false });
  assert.deepEqual(r.pairs.sort(), ["btc_idr", "sol_idr", "usdt_idr"]);
  assert.equal(r.priorityIgnored, false);
});

test("gerbang terbuka tanpa checklist: kandidat + watchlist + posisi", () => {
  const r = selectCyclePairs({ ...base, priorityPairs: [], scannerExecution: true, watchlistOnly: false });
  assert.equal(r.pairs.length, 5);
});

test("stablecoin dikenali", () => {
  assert.equal(isStablecoinPair("usdt_idr"), true);
  assert.equal(isStablecoinPair("USDC_IDR"), true);
  assert.equal(isStablecoinPair("sol_idr"), false);
});
