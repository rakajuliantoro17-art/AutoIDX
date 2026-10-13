/**
 * Simulasi acak berbenih (seeded) untuk pengaman utama: ribuan urutan kejadian
 * dibangkitkan, lalu INVARIAN keselamatan diperiksa pada tiap langkah.
 * Membuktikan logika keputusan, BUKAN perilaku Indodax asli.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateOrderBreaker, afterOrderFailure, afterOrderSuccess, DEFAULT_ORDER_BREAKER as C,
  type OrderBreakerState,
} from "../src/services/safety/orderBreaker";
import { evaluateDailyLoss } from "../src/services/safety/dailyLossGuard";
import { SafetyGate } from "../src/services/safety/safetyGate";
import { createSafetyConfig } from "../src/services/safety/safetyConfig";
import { classify } from "../src/services/positions/positionClassify";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("SIM pemutus order: tak ada order dikirim selama OPEN; kegagalan beruntun yang dikirim tak pernah > ambang+1 per jendela", () => {
  for (let seed = 1; seed <= 500; seed++) {
    const r = rng(seed);
    let state: OrderBreakerState = { consecutiveFailures: 0, lastFailureAtMs: 0 };
    let now = 0;
    let attemptsSinceTrip = 0;
    for (let step = 0; step < 400; step++) {
      now += Math.floor(r() * 120_000); // 0-2 menit antar siklus
      const d = evaluateOrderBreaker(state, now);
      if (state.consecutiveFailures >= C.failureThreshold && now - state.lastFailureAtMs < C.cooldownMs) {
        assert.equal(d.allow, false, `seed ${seed}: order lolos saat pemutus OPEN`);
      }
      if (!d.allow) continue;
      // bursa sedang bermasalah dengan peluang 60%
      const fail = r() < 0.6;
      if (state.consecutiveFailures >= C.failureThreshold) attemptsSinceTrip++;
      state = fail ? afterOrderFailure(state, now) : afterOrderSuccess();
    }
    // percobaan setelah ambang tercapai hanya boleh lewat half-open (satu per cooldown)
    assert.ok(attemptsSinceTrip <= Math.ceil((now || 1) / C.cooldownMs) + 1, `seed ${seed}: terlalu banyak percobaan saat tripped`);
  }
});

test("SIM batas rugi harian: setelah batas tercapai, semua BUY pada hari itu diblokir", () => {
  for (let seed = 1; seed <= 500; seed++) {
    const r = rng(seed);
    const startingBalance = 1_000_000;
    const maxPct = 3;
    let pnl = 0;
    let breached = false; // kunci yang disimpan engine saat batas pertama kali terdeteksi
    for (let step = 0; step < 200; step++) {
      const d = evaluateDailyLoss({ dailyPnlIdr: pnl, maxDailyLossPercent: maxPct, startingBalance, live: true, latched: breached });
      if (breached) assert.equal(d.blocked, true, `seed ${seed}: BUY lolos setelah batas tercapai`);
      if (d.blocked) breached = true;
      pnl += Math.round((r() - 0.55) * 20_000); // cenderung rugi
    }
  }
});

test("SIM batas rugi: status tak terbaca di live SELALU memblokir, di paper tidak", () => {
  const r = rng(7);
  for (let i = 0; i < 1000; i++) {
    const pnl = Math.round((r() - 0.5) * 100_000);
    assert.equal(evaluateDailyLoss({ dailyPnlIdr: pnl, readFailed: true, maxDailyLossPercent: 3, startingBalance: 1_000_000, live: true }).blocked, true);
    const paper = evaluateDailyLoss({ dailyPnlIdr: 0, readFailed: true, maxDailyLossPercent: 3, startingBalance: 1_000_000, live: false });
    assert.equal(paper.blocked, false);
  }
});

test("SIM SafetyGate vs oracle: ALLOW hanya bila tidak ada pelanggaran; tidak pernah ALLOW saat ada pelanggaran", () => {
  const cfg = createSafetyConfig();
  const gate = new SafetyGate(cfg);
  const r = rng(99);
  for (let i = 0; i < 5000; i++) {
    const ctx = {
      dailyPnlPct: (r() - 0.7) * 0.1,
      unknownOrders: r() < 0.1 ? 1 : 0,
      consecutiveExecutionErrors: Math.floor(r() * 5),
      balanceMismatchPct: r() < 0.2 ? r() * 0.05 : 0,
      positionMismatchPct: r() < 0.2 ? r() * 0.05 : 0,
      staleOrders: r() < 0.05 ? 1 : 0,
    };
    const violated =
      ctx.dailyPnlPct <= -cfg.maxDailyLossPct ||
      ctx.unknownOrders > cfg.maxUnknownOrders ||
      ctx.consecutiveExecutionErrors >= cfg.maxConsecutiveExecutionErrors ||
      ctx.balanceMismatchPct > cfg.maxBalanceMismatchPct ||
      ctx.positionMismatchPct > cfg.maxPositionMismatchPct ||
      ctx.staleOrders > 0;
    const d = gate.evaluate(ctx as never);
    assert.equal(d.action === "ALLOW", !violated, JSON.stringify(ctx));
    assert.equal(d.safe, !violated);
  }
});

test("SIM klasifikasi posisi: HANTU tepat saat saldo bursa <= max(1% catatan, 1e-8); tidak pernah COCOK bila selisih > 2%", () => {
  const r = rng(2026);
  for (let i = 0; i < 5000; i++) {
    const local = r() * 1000;
    const exchange = r() < 0.3 ? r() * local * 0.02 : local * (0.9 + r() * 0.2);
    const s = classify(local, exchange);
    const ghost = exchange <= Math.max(local * 0.01, 1e-8);
    assert.equal(s === "HANTU", ghost, `${local}/${exchange}`);
    if (!ghost) {
      const dev = Math.abs(local - exchange) / Math.max(exchange, 1e-8);
      if (dev > 0.02) assert.notEqual(s, "COCOK");
    }
  }
});
