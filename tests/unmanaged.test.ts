import test from "node:test";
import assert from "node:assert/strict";
import { canReleaseStuck, subtractUnmanaged } from "../src/services/positions/unmanaged";

test("subtractUnmanaged: kurangi, tidak pernah negatif", () => {
  assert.ok(Math.abs(subtractUnmanaged(6.4, 2.5) - 3.9) < 1e-9);
  assert.equal(subtractUnmanaged(2, 2.5), 0);
  assert.equal(subtractUnmanaged(2, 0), 2);
});

test("skenario ADA: sisa 2.5457 + beli baru 3.9 -> rekonsiliasi cocok setelah pengurangan", () => {
  const exchange = 2.54566326 + 3.9;
  assert.ok(Math.abs(subtractUnmanaged(exchange, 2.54566326) - 3.9) < 1e-9);
});

test("canReleaseStuck: ADA di bawah minimum boleh dilepas", () => {
  const r = canReleaseStuck({ localQty: 2.54566326, exchangeQty: 2.54566326, price: 3857 });
  assert.equal(r.ok, true);
});

test("canReleaseStuck: tolak bila nilai >= minimum, saldo kurang, atau harga kosong", () => {
  assert.equal(canReleaseStuck({ localQty: 2.54566326, exchangeQty: 2.54566326, price: 3930 }).ok, false);
  assert.equal(canReleaseStuck({ localQty: 2.5, exchangeQty: 0, price: 3857 }).ok, false);
  assert.equal(canReleaseStuck({ localQty: 2.5, exchangeQty: 2.5, price: 0 }).ok, false);
  assert.equal(canReleaseStuck({ localQty: 0, exchangeQty: 2.5, price: 3857 }).ok, false);
});
