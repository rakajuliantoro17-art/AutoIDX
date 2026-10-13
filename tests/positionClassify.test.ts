import test from "node:test";
import assert from "node:assert/strict";
import { classify } from "../src/services/positions/positionClassify";

test("kasus XRP nyata: lokal 0.4034698, bursa 0 -> HANTU", () => {
  assert.equal(classify(0.4034698, 0), "HANTU");
});
test("saldo bursa sangat kecil (<1% catatan) -> HANTU", () => {
  assert.equal(classify(1, 0.005), "HANTU");
});
test("sama persis -> COCOK", () => {
  assert.equal(classify(1.5, 1.5), "COCOK");
});
test("selisih 1.9% -> COCOK, 3% -> SELISIH", () => {
  assert.equal(classify(1.019, 1), "COCOK");
  assert.equal(classify(1.03, 1), "SELISIH");
});
test("bursa lebih besar dari lokal secara signifikan -> SELISIH", () => {
  assert.equal(classify(1, 2), "SELISIH");
});
test("lokal 0 dan bursa 0 -> HANTU (tidak ada posisi nyata)", () => {
  assert.equal(classify(0, 0), "HANTU");
});
