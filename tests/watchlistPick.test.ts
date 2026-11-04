import test from "node:test";
import assert from "node:assert/strict";
import { pickBalancedWatchlist } from "../src/services/scanner/watchlistPick";

const mk = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ pair: `c${i}_idr`, opportunityScore: 50 + (i % 7), priceRangePercent: 1 + i }));

test("30 kandidat: 10 pair dengan komposisi 3 rendah, 4 sedang, 3 tinggi", () => {
  const r = pickBalancedWatchlist(mk(30));
  assert.equal(r.length, 10);
  const count = (t: string) => r.filter((x) => x.tier === t).length;
  assert.equal(count("LOW"), 3);
  assert.equal(count("MEDIUM"), 4);
  assert.equal(count("HIGH"), 3);
  assert.equal(new Set(r.map((x) => x.pair)).size, 10);
});

test("tingkat rendah dipilih dari volatilitas terendah, tinggi dari tertinggi", () => {
  const r = pickBalancedWatchlist(mk(30));
  const maxLow = Math.max(...r.filter((x) => x.tier === "LOW").map((x) => x.rangePercent));
  const minHigh = Math.min(...r.filter((x) => x.tier === "HIGH").map((x) => x.rangePercent));
  assert.ok(maxLow < minHigh);
});

test("pool kecil (<10) mengembalikan apa adanya; data invalid dibuang", () => {
  const r = pickBalancedWatchlist([
    ...mk(4),
    { pair: "BAD PAIR", opportunityScore: 99, priceRangePercent: 3 },
    { pair: "x_idr", opportunityScore: 99 },
    { pair: "c0_idr", opportunityScore: 10, priceRangePercent: 2 },
  ]);
  assert.equal(r.length, 4);
});

test("kekurangan satu tingkat diisi tingkat lain sampai 10", () => {
  const same = Array.from({ length: 12 }, (_, i) => ({ pair: `d${i}_idr`, opportunityScore: i, priceRangePercent: 5 }));
  assert.equal(pickBalancedWatchlist(same).length, 10);
});
