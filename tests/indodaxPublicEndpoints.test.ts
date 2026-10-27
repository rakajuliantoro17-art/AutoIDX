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

test("tradeHistory memanggil method privat 'tradeHistory' (bukan 'trades') dan membaca data.trades", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync("src/services/liveTrading/exchange/indodaxClient.ts", "utf8");
  assert.match(src, /privateRequest\("tradeHistory"/);
  assert.doesNotMatch(src, /privateRequest\("trades"/);
  assert.match(src, /\.trades as unknown\[\]/);
});
