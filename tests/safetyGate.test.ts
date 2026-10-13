import test from "node:test";
import assert from "node:assert/strict";
import { SafetyGate } from "../src/services/safety/safetyGate";
import { createSafetyConfig } from "../src/services/safety/safetyConfig";
import type { SafetyContext } from "../src/services/safety/safetyContext";

const clean: SafetyContext = {
  dailyPnlPct: 0,
  unknownOrders: 0,
  consecutiveExecutionErrors: 0,
  balanceMismatchPct: 0,
  positionMismatchPct: 0,
  staleOrders: 0,
} as SafetyContext;

const gate = new SafetyGate(createSafetyConfig());

test("kondisi bersih -> ALLOW", () => {
  const d = gate.evaluate(clean);
  assert.equal(d.action, "ALLOW");
  assert.equal(d.safe, true);
  assert.deepEqual(d.reasons, []);
});

test("rugi harian tepat di batas (-3%) -> HALT", () => {
  const d = gate.evaluate({ ...clean, dailyPnlPct: -0.03 });
  assert.equal(d.action, "HALT");
  assert.equal(d.safe, false);
});

test("rugi harian di bawah batas (-2.9%) -> ALLOW", () => {
  assert.equal(gate.evaluate({ ...clean, dailyPnlPct: -0.029 }).action, "ALLOW");
});

test("error eksekusi beruntun mencapai batas -> HALT", () => {
  assert.equal(gate.evaluate({ ...clean, consecutiveExecutionErrors: 3 }).action, "HALT");
  assert.equal(gate.evaluate({ ...clean, consecutiveExecutionErrors: 2 }).action, "ALLOW");
});

test("order stale -> HALT (bukan manual recovery)", () => {
  assert.equal(gate.evaluate({ ...clean, staleOrders: 1 }).action, "HALT");
});

test("order tak dikenal -> MANUAL_RECOVERY", () => {
  const d = gate.evaluate({ ...clean, unknownOrders: 1 });
  assert.equal(d.action, "MANUAL_RECOVERY");
  assert.equal(d.safe, false);
});

test("selisih posisi di atas 1% -> MANUAL_RECOVERY, tepat 1% -> ALLOW", () => {
  assert.equal(gate.evaluate({ ...clean, positionMismatchPct: 0.0101 }).action, "MANUAL_RECOVERY");
  assert.equal(gate.evaluate({ ...clean, positionMismatchPct: 0.01 }).action, "ALLOW");
});

test("selisih saldo di atas 1% -> MANUAL_RECOVERY", () => {
  assert.equal(gate.evaluate({ ...clean, balanceMismatchPct: 0.02 }).action, "MANUAL_RECOVERY");
});

test("requireManualRecovery=false -> selisih posisi menjadi HALT", () => {
  const g = new SafetyGate(createSafetyConfig({ requireManualRecovery: false }));
  assert.equal(g.evaluate({ ...clean, positionMismatchPct: 0.5 }).action, "HALT");
});

test("beberapa pelanggaran -> semua alasan tercatat", () => {
  const d = gate.evaluate({ ...clean, dailyPnlPct: -0.5, staleOrders: 2, unknownOrders: 1 });
  assert.equal(d.reasons.length, 3);
});

test("keputusan tidak bisa dimutasi (frozen)", () => {
  const d = gate.evaluate(clean);
  assert.throws(() => { (d as { action: string }).action = "ALLOW2"; });
});

test("konfigurasi tidak valid ditolak", () => {
  assert.throws(() => createSafetyConfig({ maxDailyLossPct: 0 }));
  assert.throws(() => createSafetyConfig({ maxDailyLossPct: 1.5 }));
  assert.throws(() => createSafetyConfig({ maxUnknownOrders: -1 }));
  assert.throws(() => createSafetyConfig({ maxConsecutiveExecutionErrors: 0 }));
});
