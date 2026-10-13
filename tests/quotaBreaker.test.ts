import test from "node:test";
import assert from "node:assert/strict";
import {
  isQuotaError, msUntilQuotaReset, QuotaBreaker, withQuotaGuard, QUOTA_COOLDOWN_MS,
} from "../src/lib/quota/quotaBreaker";

function mockRes() {
  const r: any = { statusCode: 200, headers: {} as Record<string, string>, body: undefined, writableEnded: false };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.json = (b: unknown) => { r.body = b; r.writableEnded = true; return r; };
  r.setHeader = (k: string, v: string) => { r.headers[k] = v; };
  return r;
}

test("isQuotaError mengenali kode gRPC 8, resource-exhausted, dan pesan kuota", () => {
  assert.equal(isQuotaError({ code: 8 }), true);
  assert.equal(isQuotaError({ code: "resource-exhausted" }), true);
  assert.equal(isQuotaError(new Error("8 RESOURCE_EXHAUSTED: Quota exceeded.")), true);
  assert.equal(isQuotaError(new Error("network down")), false);
  assert.equal(isQuotaError(null), false);
  assert.equal(isQuotaError("x"), false);
});

test("msUntilQuotaReset: sebelum dan sesudah 07:00 UTC", () => {
  const before = Date.UTC(2026, 9, 13, 6, 0); // 06:00 UTC -> 1 jam lagi
  assert.equal(msUntilQuotaReset(before), 3600_000);
  const after = Date.UTC(2026, 9, 13, 8, 0); // 08:00 UTC -> 23 jam lagi
  assert.equal(msUntilQuotaReset(after), 23 * 3600_000);
});

test("breaker: trip menutup sampai cooldown lewat", () => {
  const b = new QuotaBreaker();
  assert.equal(b.isOpen(1000), false);
  b.trip(1000);
  assert.equal(b.isOpen(1000 + QUOTA_COOLDOWN_MS - 1), true);
  assert.equal(b.isOpen(1000 + QUOTA_COOLDOWN_MS), false);
});

test("breaker: 2 timeout beruntun menutup, sukses mereset hitungan", () => {
  const b = new QuotaBreaker();
  b.recordTimeout(0);
  b.recordSuccess();
  b.recordTimeout(0);
  assert.equal(b.isOpen(1), false);
  b.recordTimeout(0);
  assert.equal(b.isOpen(1), true);
});

test("guard: error kuota -> 503 cepat lalu panggilan berikutnya dilewati", async () => {
  let calls = 0;
  const g = withQuotaGuard("T", async () => { calls++; throw new Error("RESOURCE_EXHAUSTED"); }, new QuotaBreaker(), 1000);
  const r1 = mockRes(); await g({} as any, r1);
  assert.equal(r1.statusCode, 503);
  const r2 = mockRes(); await g({} as any, r2);
  assert.equal(r2.statusCode, 503);
  assert.equal((r2.body as any).skipped, "quota");
  assert.equal(calls, 1);
  assert.ok(r2.headers["Retry-After"]);
});

test("guard: handler lambat -> 504 setelah deadline", async () => {
  const g = withQuotaGuard("T", () => new Promise(() => {}), new QuotaBreaker(), 20);
  const r = mockRes(); await g({} as any, r);
  assert.equal(r.statusCode, 504);
});

test("guard: handler normal tidak diganggu", async () => {
  const g = withQuotaGuard("T", async (_q: any, res: any) => res.status(200).json({ ok: 1 }), new QuotaBreaker(), 1000);
  const r = mockRes(); await g({} as any, r);
  assert.equal(r.statusCode, 200);
});

test("guard: error non-kuota dilempar ulang, pemutus tidak aktif", async () => {
  const b = new QuotaBreaker();
  const g = withQuotaGuard("T", async () => { throw new Error("bug lain"); }, b, 1000);
  await assert.rejects(() => g({} as any, mockRes()), /bug lain/);
  assert.equal(b.isOpen(Date.now()), false);
});
