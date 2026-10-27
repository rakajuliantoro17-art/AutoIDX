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

test("riwayat v2 memakai kunci v2 dari kredensial akun (bukan kunci v1), v1 tetap untuk method lain", async () => {
  const { IndodaxClient } = await import("../src/services/liveTrading/exchange/indodaxClient");
  const seen: { url: string; headers: Record<string, string> }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    seen.push({ url: String(url), headers: init?.headers as Record<string, string> });
    return new Response(JSON.stringify({ data: [{ tradeId: "1", orderId: "avaxidr-market-1", price: "161941", qty: "0.09243489", quoteQty: "14968", commission: "30", isBuyer: true, time: 1792609251000 }] }), { status: 200 });
  }) as typeof fetch;
  try {
    const c = new IndodaxClient({ apiKey: "V1KEY", secretKey: "V1SECRET", v2ApiKey: "V2KEY", v2SecretKey: "V2SECRET" });
    const r = await c.tradeHistory({ pair: "avax_idr", since: Math.floor(Date.now() / 1000) - 3600, count: 20 });
    assert.equal(r.success, true);
    assert.equal(seen[0].headers["X-APIKEY"], "V2KEY");
    assert.match(seen[0].url, /api\/v2\/myTrades\?symbol=avaxidr/);
    const rows = (r as { data: Record<string, unknown>[] }).data;
    assert.equal(rows[0].type, "buy");
    assert.equal(rows[0].avax, "0.09243489");

    seen.length = 0;
    const c2 = new IndodaxClient({ apiKey: "V1KEY", secretKey: "V1SECRET" });
    await c2.tradeHistory({ pair: "avax_idr", count: 10 });
    assert.equal(seen[0].headers["X-APIKEY"], "V1KEY");
  } finally {
    globalThis.fetch = realFetch;
  }
});
