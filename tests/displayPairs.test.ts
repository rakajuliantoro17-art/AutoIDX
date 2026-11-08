import test from "node:test";
import assert from "node:assert/strict";
import { selectDisplayPairs } from "../src/services/scheduler/displayPairs";

test("watchlist + posisi terbuka, unik, huruf kecil, urut", () => {
  const r = selectDisplayPairs(["XAUT_idr", "btc_idr", " drx_idr "], ["drx_idr", "uai_idr"], ["btc_idr"]);
  assert.deepEqual(r, ["btc_idr", "drx_idr", "uai_idr", "xaut_idr"]);
});
test("pair lama yang tidak di watchlist dan tidak terbuka tidak muncul", () => {
  const r = selectDisplayPairs(["btc_idr"], [], ["eth_idr"]);
  assert.ok(!r.includes("zerebro_idr"));
  assert.deepEqual(r, ["btc_idr"]);
});
test("keduanya kosong -> fallback", () => {
  assert.deepEqual(selectDisplayPairs(undefined, [], ["ETH_idr", "btc_idr"]), ["btc_idr", "eth_idr"]);
});
