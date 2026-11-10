import test from "node:test";
import assert from "node:assert/strict";
import { runExitCycle, type ExitCycleDeps } from "../src/services/scheduler/exitCycle";

function lock(acquired = true, release: () => Promise<void> = async () => {}) {
  return async () => ({ acquired, reason: acquired ? undefined : ("running" as const), runId: "r", release });
}
function deps(over: Partial<ExitCycleDeps> = {}): ExitCycleDeps {
  return {
    acquireLock: lock(),
    getOpenPairs: async () => ["uai_idr", "btc_idr"],
    getPrice: async () => 100,
    checkExit: async (i) => (i.pair === "uai_idr" ? { action: "SELL" } : null),
    ...over,
  };
}

test("exit hanya untuk pair yang kena trigger", async () => {
  const r = await runExitCycle(deps());
  assert.equal(r.status, "completed");
  if (r.status === "completed") {
    assert.equal(r.checked, 2);
    assert.deepEqual(r.exited, ["uai_idr"]);
  }
});
test("skip bila lock tidak didapat (scan sedang jalan)", async () => {
  const r = await runExitCycle(deps({ acquireLock: lock(false) }));
  assert.deepEqual(r, { status: "skipped", throttled: false, reason: "Scan or exit cycle still running" });
});
test("harga tidak valid -> error dicatat, tidak ada SELL", async () => {
  let called = 0;
  const r = await runExitCycle(deps({ getPrice: async () => null, checkExit: async () => { called++; return {}; } }));
  assert.equal(called, 0);
  assert.equal(r.status === "completed" && r.errors.length, 2);
});
test("lock dilepas walau getOpenPairs gagal", async () => {
  let released = false;
  await assert.rejects(
    runExitCycle(deps({ acquireLock: lock(true, async () => { released = true; }), getOpenPairs: async () => { throw new Error("x"); } }))
  );
  assert.ok(released);
});
