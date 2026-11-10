import test from "node:test";
import assert from "node:assert/strict";
import { checkSlWidthCap, resolveMaxEntrySlPercent } from "../src/services/trading/slWidthCap";

test("default batas 3%; env kosong/invalid -> default", () => {
  assert.equal(resolveMaxEntrySlPercent(undefined), 3);
  assert.equal(resolveMaxEntrySlPercent(""), 3);
  assert.equal(resolveMaxEntrySlPercent("abc"), 3);
  assert.equal(resolveMaxEntrySlPercent("-1"), 3);
  assert.equal(resolveMaxEntrySlPercent("4"), 4);
  assert.equal(resolveMaxEntrySlPercent("0"), 0);
});
test("kasus nyata: ERN SL 7,18% dan ICNT 6,07% diblokir; ENA/XRP SL 2% lolos", () => {
  assert.equal(checkSlWidthCap(7.18, 14968, 3).ok, false);
  assert.equal(checkSlWidthCap(6.07, 14968, 3).ok, false);
  assert.equal(checkSlWidthCap(2, 14968, 3).ok, true);
  assert.equal(checkSlWidthCap(2.22, 14968, 3).ok, true);
});
test("tepat di batas lolos; 0 = nonaktif; rugi di SL dihitung", () => {
  assert.equal(checkSlWidthCap(3, 15000, 3).ok, true);
  assert.equal(checkSlWidthCap(8, 15000, 0).ok, true);
  assert.equal(checkSlWidthCap(7, 15000, 3).lossAtStopIdr, 1050);
});
