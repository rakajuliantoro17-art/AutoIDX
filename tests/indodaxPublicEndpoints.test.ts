import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// api.js memakai impor tanpa ekstensi yang hanya dipahami bundler Next,
// jadi dijaga lewat pemeriksaan sumber agar format endpoint lama (403 dari
// Indodax, diukur 2026-10-21) tidak kembali.
const src = readFileSync("src/services/indodax/api.js", "utf8");

test("endpoint per-pair memakai format resmi /api/{ticker|depth|trades}/{idtanpa_}", () => {
  assert.ok(src.includes("`${this.publicBaseUrl}/ticker/${toPairId(pair)}`"));
  assert.ok(src.includes("`${this.publicBaseUrl}/depth/${toPairId(pair)}`"));
  assert.ok(src.includes("`${this.publicBaseUrl}/trades/${toPairId(pair)}`"));
});

test("format lama /api/{pair}/{depth|trades|ticker} tidak dipakai lagi", () => {
  assert.equal(/publicBaseUrl\}\/\$\{pair\}\//.test(src), false);
});

test("toPairId menghapus garis bawah dan huruf kecil", () => {
  const m = /function toPairId\(pair\) \{\s*return ([^;]+);/.exec(src);
  assert.ok(m, "helper toPairId ada");
  const fn = new Function("pair", `return ${m![1]};`) as (p: string) => string;
  assert.equal(fn("BTC_IDR"), "btcidr");
  assert.equal(fn("doge_idr"), "dogeidr");
});

test("limit BUY memakai jumlah koin, market BUY tetap idr (source guard)", () => {
  const src = readFileSync("src/services/liveTrading/exchange/indodaxClient.ts", "utf8");
  assert.match(src, /params\.type === "buy" && orderType === "limit"/);
  assert.match(src, /body\.idr = params\.idr/);
});

test("tradeHistory memakai API v2 myTrades (legacy 'tradeHistory' DEPRECATED) dan tidak memanggil method legacy", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync("src/services/liveTrading/exchange/indodaxClient.ts", "utf8");
  assert.match(src, /\/api\/v2\/myTrades/);
  assert.match(src, /\/api\/v2\/order\/histories/);
  assert.doesNotMatch(src, /privateRequest\("tradeHistory"/);
  assert.doesNotMatch(src, /privateRequest\("orderHistory"/);
  assert.match(src, /X-APIKEY/);
});

test("normalizeV2Trade memetakan ke field gaya legacy (detik, type, qty per aset)", async () => {
  const { normalizeV2Trade } = await import("../src/services/liveTrading/exchange/indodaxClient");
  const n = normalizeV2Trade(
    { tradeId: "1", orderId: "dogeidr-market-9", price: "2500", qty: "6", quoteQty: "15000", commission: "33", isBuyer: true, time: 1723442692520 },
    "doge"
  );
  assert.equal(n.type, "buy");
  assert.equal(n.date, 1723442692);
  assert.equal(n.trade_time, 1723442692);
  assert.equal(n.doge, "6");
  assert.equal(normalizeV2Trade({ isBuyer: false, time: 1000 }, "doge").type, "sell");
});
