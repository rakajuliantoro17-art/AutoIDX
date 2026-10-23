import test from "node:test";
import assert from "node:assert/strict";
import { farLimitPrice, runTradePermissionTest, type TradeTestClient } from "../src/services/accounts/tradePermissionTest";

const noSleep = async () => {};

function fake(over: Partial<TradeTestClient> = {}): TradeTestClient & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    getLastPrice: async () => 1_464_000_000,
    placeLimitBuy: async (p) => { calls.push(`place@${p.price}`); return { success: true, orderId: "123" }; },
    cancel: async () => { calls.push("cancel"); return { success: true }; },
    openOrderIds: async () => [],
    ...over,
  };
}

test("harga uji dibulatkan ke bawah dan jauh di bawah pasar", () => {
  const p = farLimitPrice(1_464_331_000, 0.4, 1_000_000);
  assert.equal(p, 878_000_000);
  assert.ok(p < 1_464_331_000 * 0.7);
});

test("sukses: place, cancel, terverifikasi hilang", async () => {
  const c = fake();
  const r = await runTradePermissionTest(c, { sleep: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.verdict, "PERMISSION_OK");
  assert.deepEqual(c.calls, ["place@878000000", "cancel"]);
});

test("order ditolak (mis. izin trade tidak ada): tidak ada cancel", async () => {
  const c = fake({ placeLimitBuy: async () => ({ success: false, message: "Invalid permission" }) });
  const r = await runTradePermissionTest(c, { sleep: noSleep });
  assert.equal(r.ok, false);
  assert.equal(r.verdict, "PLACE_REJECTED");
  assert.ok(!c.calls.includes("cancel"));
});

test("cancel gagal sekali lalu berhasil", async () => {
  let n = 0;
  const c = fake({ cancel: async () => (++n < 2 ? { success: false, message: "busy" } : { success: true }) });
  const r = await runTradePermissionTest(c, { sleep: noSleep });
  assert.equal(r.ok, true);
  assert.equal(n, 2);
});

test("cancel selalu gagal dan order masih terbuka: gagal keras dengan orderId", async () => {
  const c = fake({ cancel: async () => ({ success: false, message: "down" }), openOrderIds: async () => ["123"] });
  const r = await runTradePermissionTest(c, { sleep: noSleep });
  assert.equal(r.ok, false);
  assert.equal(r.verdict, "CANCEL_FAILED_ORDER_OPEN");
  assert.equal(r.orderId, "123");
  assert.match(r.message, /123/);
});

test("harga pasar tidak terbaca: tidak ada order dikirim", async () => {
  const c = fake({ getLastPrice: async () => null });
  const r = await runTradePermissionTest(c, { sleep: noSleep });
  assert.equal(r.verdict, "NO_PRICE");
  assert.equal(c.calls.length, 0);
});
