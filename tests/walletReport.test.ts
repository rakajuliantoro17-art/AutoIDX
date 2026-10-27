import test from "node:test";
import assert from "node:assert/strict";
import { classifyHoldings } from "../src/services/positions/walletReport";

test("posisi dikelola, ADA di luar kelolaan, koin tak terlacak", () => {
  const rows = classifyHoldings({
    balances: { idr: 34371, zerebro: 27.8234, ada: 2.54566326, bnb: 0.00111415 },
    open: { zerebro: 27.8234 },
    unmanaged: { ada: 2.54566326 },
  });
  const by = Object.fromEntries(rows.map((r) => [r.asset, r.status]));
  assert.equal(by.zerebro, "DIKELOLA");
  assert.equal(by.ada, "DI_LUAR_KELOLAAN");
  assert.equal(by.bnb, "TAK_TERLACAK");
  assert.equal(rows.find((r) => r.asset === "idr"), undefined);
});

test("sisa kecil di bawah toleransi 2% tidak ditandai tak terlacak", () => {
  const rows = classifyHoldings({ balances: { ada: 5.05 }, open: { ada: 5 }, unmanaged: {} });
  assert.equal(rows[0].status, "DIKELOLA");
});

test("koin dibeli di pair yang juga di luar kelolaan: selisih terdeteksi", () => {
  const rows = classifyHoldings({ balances: { ada: 6.4 }, open: { ada: 2 }, unmanaged: { ada: 2.5 } });
  assert.equal(rows[0].status, "TAK_TERLACAK");
  assert.ok(Math.abs(rows[0].extraQty - 1.9) < 1e-9);
});

test("saldo nol atau debu diabaikan", () => {
  assert.equal(classifyHoldings({ balances: { btc: 0, eth: 1e-10 }, open: {}, unmanaged: {} }).length, 0);
});

test("penandaan di luar kelolaan yang saldonya sudah 0 tetap ditampilkan (basi) agar bisa dibatalkan", () => {
  const rows = classifyHoldings({ balances: { avax: 0 }, open: {}, unmanaged: { avax: 0.0924 } });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].asset, "avax");
  assert.equal(rows[0].status, "DI_LUAR_KELOLAAN");
  assert.equal(rows[0].total, 0);
});
