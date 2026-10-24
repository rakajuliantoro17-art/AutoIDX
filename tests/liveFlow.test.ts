/**
 * Harness bursa tiruan: menjalankan live.ts ASLI (liveTradingService.buy/sell)
 * beserta liveOrderLock & orderBreakerStore ASLI, dengan Firestore dan Indodax
 * diganti versi palsu di memori. Membuktikan logika kunci/pemutus/UNCERTAIN
 * pada jalur order nyata, BUKAN perilaku Indodax sungguhan.
 * Dijalankan dengan --experimental-test-module-mocks (lihat package.json).
 */
import test, { mock, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

process.env.BOT_CANARY_ENABLED = "true";
process.env.BOT_CANARY_REQUIRE_RECONCILIATION = "false";

// ---------- Firestore palsu (atomik: transaksi diserialkan) ----------
const store = new Map<string, any>();
let dbFail: ((op: string, path: string) => boolean) | null = null;
let txQueue: Promise<unknown> = Promise.resolve();
const check = (op: string, path: string) => { if (dbFail?.(op, path)) throw new Error(`fake firestore ${op} gagal: ${path}`); };
const docRef = (path: string) => ({
  path,
  async get() { check("get", path); const v = store.get(path); return { exists: v !== undefined, data: () => (v ? { ...v } : undefined) }; },
  async set(data: any, opts?: { merge?: boolean }) { check("set", path); store.set(path, opts?.merge ? { ...(store.get(path) ?? {}), ...data } : { ...data }); },
});
const fakeDb = {
  collection: (c: string) => ({ doc: (d: string) => docRef(`${c}/${d}`) }),
  runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    const run = txQueue.then(() => fn({
      get: (ref: any) => ref.get(),
      set: (ref: any, data: any) => { check("set", ref.path); store.set(ref.path, { ...data }); },
    }));
    txQueue = run.catch(() => undefined);
    return run;
  },
};

// ---------- Bursa palsu ----------
type Outcome = "ok" | "reject" | "timeout" | "minorder";
let nextOutcome: Outcome | ((side: string) => Outcome) = "ok";
const exchangeCalls: { type: string; pair: string }[] = [];
let tradeDelayMs = 0;
class FakeIndodaxClient {
  async getInfo() { return { success: true, data: { balance: { idr: 10_000_000 } } }; }
  async trade(p: { pair: string; type: string }) {
    exchangeCalls.push({ type: p.type, pair: p.pair });
    if (tradeDelayMs) await new Promise((r) => setTimeout(r, tradeDelayMs));
    const o = typeof nextOutcome === "function" ? nextOutcome(p.type) : nextOutcome;
    if (o === "ok") return { success: true, data: { order_id: exchangeCalls.length, spend_rp: 10000, receive_btc: 0.0001, fee: 10 } };
    if (o === "minorder") return { success: false, message: "Minimum order 2.59268861 ADA", certainty: "CERTAIN" };
    if (o === "reject") return { success: false, message: "ditolak bursa", certainty: "CERTAIN" };
    return { success: false, message: "timeout jaringan", certainty: "UNCERTAIN" };
  }
}

const alerts: string[] = [];
const canaryRecords: any[] = [];
const trades: any[] = [];
const root = "../src/";
let live: any;
let lockMod: any;

before(async () => {
  mock.module(root + "services/firebase/admin.ts", { namedExports: { adminDb: fakeDb } });
  mock.module(root + "services/liveTrading/exchange/indodaxClient.ts", { namedExports: { IndodaxClient: FakeIndodaxClient } });
  mock.module(root + "services/firebase/indodaxAccountsAdmin.ts", { namedExports: { getActiveIndodaxAccount: async () => ({ apiKey: "k", secretKey: "s" }) } });
  mock.module(root + "services/firebase/logService.ts", { namedExports: { recordLog: async () => {}, recordTrade: async (t: any) => { trades.push(t); } } });
  mock.module(root + "services/firebase/botState.ts", { namedExports: { getOpenPositionsCount: async () => 0 } });
  mock.module(root + "services/liveTrading/monitoring/canaryStore.ts", { namedExports: {
    getCanarySnapshot: async () => ({ status: "OK", reasons: [] }),
    getRecentCanaryOrders: async () => [],
    recordCanaryOrder: async (m: any) => { canaryRecords.push(m); },
  } });
  mock.module(root + "services/firebase/reconciliationStatus.ts", { namedExports: { getReconciliationStatus: async () => ({}) } });
  mock.module(root + "services/firebase/executionAuditSink.ts", { defaultExport: { record: async () => {} }, namedExports: { executionAudit: { record: async () => {} } } });
  mock.module(root + "services/alerts/raiseAlert.ts", { namedExports: { raiseAlert: async (kind: string) => { alerts.push(kind); } } });
  live = (await import(root + "services/trading/live.ts")).default;
  lockMod = await import(root + "services/firebase/liveOrderLock.ts");
});

beforeEach(() => {
  store.clear(); canaryRecords.length = 0; exchangeCalls.length = 0; alerts.length = 0; trades.length = 0;
  dbFail = null; nextOutcome = "ok"; tradeDelayMs = 0;
});

const buyReq = (pair = "btc_idr") => ({ pair, price: 100_000_000, tradeAmountIdr: 10000, strategy: "t" });
const sellReq = (pair = "btc_idr") => ({ pair, price: 100_000_000, amount: 0.0001, strategy: "t" });
const tryBuy = async (pair?: string) => { try { await live.buy(buyReq(pair)); return "ok"; } catch (e) { return (e as Error).message; } };
const trySell = async (pair?: string) => { try { await live.sell(sellReq(pair)); return "ok"; } catch (e) { return (e as Error).message; } };
const buyCalls = () => exchangeCalls.filter((c) => c.type === "buy").length;
const lockStatus = (pair: string, side: string) => store.get(`live_order_locks/${pair}_${side}`)?.status;

test("BUY sukses: satu panggilan bursa, lock COMPLETED, trade tercatat", async () => {
  assert.equal(await tryBuy(), "ok");
  assert.equal(buyCalls(), 1);
  assert.equal(lockStatus("btc_idr", "BUY"), "COMPLETED");
  assert.equal(trades.length, 1);
});

test("BUY timeout (UNCERTAIN): lock ditahan, alert, BUY ulang diblokir tanpa menyentuh bursa, SELL tetap boleh", async () => {
  nextOutcome = "timeout";
  assert.match(await tryBuy(), /timeout/);
  assert.equal(lockStatus("btc_idr", "BUY"), "UNCERTAIN");
  assert.ok(alerts.includes("ORDER_UNCERTAIN"));
  nextOutcome = "ok";
  const before = buyCalls();
  assert.match(await tryBuy(), /TIDAK PASTI/);
  assert.equal(buyCalls(), before, "tidak boleh ada order baru saat UNCERTAIN");
  assert.equal(await trySell(), "ok");
});

test("SELL timeout (UNCERTAIN): SELL ulang untuk pair itu diblokir, BUY pair lain tidak terpengaruh", async () => {
  nextOutcome = (s) => (s === "sell" ? "timeout" : "ok");
  assert.match(await trySell(), /timeout/);
  assert.equal(lockStatus("btc_idr", "SELL"), "UNCERTAIN");
  const c = exchangeCalls.length;
  assert.match(await trySell(), /TIDAK PASTI/);
  assert.equal(exchangeCalls.length, c);
  assert.equal(await tryBuy("eth_idr"), "ok");
});

test("3 penolakan beruntun membuka pemutus; BUY ke-4 tidak sampai bursa; setelah cooldown 1 percobaan; sukses menutup", async () => {
  mock.timers.enable({ apis: ["Date"], now: 1_700_000_000_000 });
  try {
    nextOutcome = "reject";
    for (let i = 0; i < 3; i++) { await tryBuy(); mock.timers.tick(61_000); }
    assert.equal(buyCalls(), 3);
    const msg = await tryBuy();
    assert.equal(buyCalls(), 3, "pemutus terbuka: tidak boleh ke bursa");
    assert.ok(alerts.includes("ORDER_BREAKER"), msg);
    mock.timers.tick(11 * 60_000);
    nextOutcome = "ok";
    assert.equal(await tryBuy(), "ok");
    assert.equal(buyCalls(), 4);
    assert.equal(store.get("risk_state/order_breaker")?.consecutiveFailures, 0);
  } finally { mock.timers.reset(); }
});

test("SELL tidak pernah diblokir pemutus order", async () => {
  mock.timers.enable({ apis: ["Date"], now: 1_700_000_000_000 });
  try {
    nextOutcome = "reject";
    for (let i = 0; i < 3; i++) { await tryBuy(); mock.timers.tick(61_000); }
    nextOutcome = "ok";
    assert.equal(await trySell(), "ok");
  } finally { mock.timers.reset(); }
});

test("status pemutus tak terbaca: BUY diblokir (fail-closed), SELL tetap jalan", async () => {
  dbFail = (op, path) => op === "get" && path === "risk_state/order_breaker";
  assert.notEqual(await tryBuy(), "ok");
  assert.equal(buyCalls(), 0);
  assert.equal(await trySell(), "ok");
});

test("dua BUY bersamaan untuk pair yang sama: hanya satu sampai bursa", async () => {
  tradeDelayMs = 20;
  const r = await Promise.all([tryBuy(), tryBuy(), tryBuy()]);
  assert.equal(buyCalls(), 1);
  assert.equal(r.filter((x) => x === "ok").length, 1);
});

test("lock PENDING basi (proses mati) kedaluwarsa setelah 60 dtk, tapi UNCERTAIN tidak pernah kedaluwarsa", async () => {
  mock.timers.enable({ apis: ["Date"], now: 1_700_000_000_000 });
  try {
    store.set("live_order_locks/btc_idr_BUY", { status: "PENDING", lockedAt: Date.now() });
    assert.match(await tryBuy(), /sedang diproses/);
    mock.timers.tick(61_000);
    assert.equal(await tryBuy(), "ok");
    store.set("live_order_locks/eth_idr_BUY", { status: "UNCERTAIN", lockedAt: Date.now() });
    mock.timers.tick(24 * 3600_000);
    assert.match(await tryBuy("eth_idr"), /TIDAK PASTI/);
    await lockMod.resolveLiveOrderLock("eth_idr", "BUY");
    assert.equal(await tryBuy("eth_idr"), "ok");
  } finally { mock.timers.reset(); }
});

// ---------- Fuzz: urutan kejadian acak, invarian dicek di tiap langkah ----------
function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

test("FUZZ: 150 skenario acak, invarian kunci & pemutus tak pernah dilanggar", async () => {
  const pairs = ["btc_idr", "eth_idr", "xrp_idr"];
  for (let seed = 1; seed <= 150; seed++) {
    store.clear(); exchangeCalls.length = 0; alerts.length = 0; trades.length = 0; dbFail = null;
    const r = rng(seed);
    mock.timers.enable({ apis: ["Date"], now: 1_700_000_000_000 });
    try {
      for (let step = 0; step < 40; step++) {
        const pair = pairs[Math.floor(r() * pairs.length)];
        const x = r();
        nextOutcome = x < 0.5 ? "ok" : x < 0.8 ? "reject" : "timeout";
        const action = r();
        if (action < 0.55) {
          const uncertain = lockStatus(pair, "BUY") === "UNCERTAIN";
          const bs = store.get("risk_state/order_breaker");
          const open = (bs?.consecutiveFailures ?? 0) >= 3 && Date.now() - (bs?.lastFailureAtMs ?? 0) < 10 * 60_000;
          const n = buyCalls();
          await tryBuy(pair);
          if (uncertain) assert.equal(buyCalls(), n, `seed ${seed}: BUY lolos saat UNCERTAIN`);
          if (open) assert.equal(buyCalls(), n, `seed ${seed}: BUY lolos saat pemutus OPEN`);
        } else if (action < 0.8) {
          const uncertain = lockStatus(pair, "SELL") === "UNCERTAIN";
          const n = exchangeCalls.filter((c) => c.type === "sell").length;
          await trySell(pair);
          const after = exchangeCalls.filter((c) => c.type === "sell").length;
          if (uncertain) assert.equal(after, n, `seed ${seed}: SELL lolos saat UNCERTAIN`);
          else assert.equal(after, n + 1, `seed ${seed}: SELL sehat tak boleh diblokir pemutus/lock BUY`);
        } else if (action < 0.9) {
          mock.timers.tick(Math.floor(r() * 15 * 60_000));
        } else if (lockStatus(pair, "BUY") === "UNCERTAIN") {
          await lockMod.resolveLiveOrderLock(pair, "BUY");
        } else {
          mock.timers.tick(61_000);
        }
      }
    } finally { mock.timers.reset(); }
  }
});

test("SELL di bawah minimum order: tidak ke bursa, bukan FAILED canary, lock bersih, tidak ada alert", async () => {
  const req = { pair: "ada_idr", price: 3857, amount: 2.54566326, strategy: "t" };
  let err: any;
  try { await live.sell(req); } catch (e) { err = e; }
  assert.equal(err?.name, "BelowMinimumOrderError");
  assert.equal(exchangeCalls.length, 0, "tidak boleh mengirim order di bawah minimum");
  assert.equal(canaryRecords.filter((m) => m.status === "FAILED").length, 0);
  assert.equal(lockStatus("ada_idr", "SELL"), undefined);
  assert.equal(alerts.length, 0);
});

test("SELL ditolak bursa 'Minimum order': BelowMinimumOrderError, bukan FAILED, bukan UNCERTAIN, bisa dicoba lagi", async () => {
  nextOutcome = "minorder";
  let err: any;
  try { await live.sell(sellReq()); } catch (e) { err = e; }
  assert.equal(err?.name, "BelowMinimumOrderError");
  assert.equal(canaryRecords.filter((m) => m.status === "FAILED").length, 0);
  assert.notEqual(lockStatus("btc_idr", "SELL"), "UNCERTAIN");
  assert.equal(alerts.length, 0);
  nextOutcome = "ok";
  assert.equal(await trySell(), "ok", "setelah harga naik SELL harus bisa lewat");
});

test("SELL gagal biasa (ditolak bursa) tetap dicatat FAILED canary", async () => {
  nextOutcome = "reject";
  assert.match(await trySell(), /ditolak bursa/);
  assert.equal(canaryRecords.filter((m) => m.status === "FAILED").length, 1);
});
