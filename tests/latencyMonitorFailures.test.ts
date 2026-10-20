import { test, mock } from "node:test";
import assert from "node:assert/strict";

mock.module("../src/services/firebase/admin.ts", {
  namedExports: { adminDb: {} },
});

test("kegagalan measure tidak menulis log; ringkasan penyebab tersedia lalu dikosongkan", async () => {
  const { LatencyMonitor } = await import("../src/services/monitor/latencyMonitor");
  const m = new LatencyMonitor();

  const boom = Object.assign(new Error("HTTP Error: 429"), { status: 429 });
  for (let i = 0; i < 3; i++) {
    const r = await m.measure("indodax_public", async () => { throw boom; });
    assert.equal(r.success, false);
  }
  const ok = await m.measure("indodax_public", async () => "fine");
  assert.equal(ok.success, true);

  assert.deepEqual(m.takeFailureSummary(), { "429 HTTP Error: 429": 3 });
  assert.deepEqual(m.takeFailureSummary(), {}, "dikosongkan setelah diambil");
});

test("ringkasan menembus pembungkus RetryError sampai status+endpoint asli", async () => {
  const { LatencyMonitor } = await import("../src/services/monitor/latencyMonitor");
  const m = new LatencyMonitor();
  const root = Object.assign(new Error("HTTP Error: 403"), { status: 403, endpoint: "trades" });
  const wrapped = Object.assign(new Error("Error is not retryable"), { name: "RetryError", cause: root });
  await m.measure("indodax_public", async () => { throw wrapped; });
  await m.measure("indodax_public", async () => { throw wrapped; });
  assert.deepEqual(m.takeFailureSummary(), { "403 trades HTTP Error: 403": 2 });
});
