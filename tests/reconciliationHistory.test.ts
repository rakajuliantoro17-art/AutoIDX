import test from "node:test";
import assert from "node:assert/strict";
import { shouldRecordHistory } from "../src/services/safety/reconciliationHistory";

test("belum ada checkpoint sebelumnya -> dicatat", () => {
  assert.equal(shouldRecordHistory(null, { consistent: true, mismatchCount: 0 }), true);
});
test("status sama persis -> tidak dicatat (hemat tulis)", () => {
  const s = { consistent: true, mismatchCount: 0 };
  assert.equal(shouldRecordHistory(s, { ...s }), false);
});
test("konsisten -> tidak konsisten dicatat, dan sebaliknya", () => {
  assert.equal(shouldRecordHistory({ consistent: true, mismatchCount: 0 }, { consistent: false, mismatchCount: 1 }), true);
  assert.equal(shouldRecordHistory({ consistent: false, mismatchCount: 1 }, { consistent: true, mismatchCount: 0 }), true);
});
test("jumlah selisih berubah saat masih tidak konsisten -> dicatat", () => {
  assert.equal(shouldRecordHistory({ consistent: false, mismatchCount: 1 }, { consistent: false, mismatchCount: 2 }), true);
});
