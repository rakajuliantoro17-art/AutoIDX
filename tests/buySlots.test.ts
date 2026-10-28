import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { planSlotClaim } from "../src/services/trading/buySlots";

const now = 1_000_000;

test("slot: BUY serentak tidak boleh melewati batas (kasus 13.10: 1 terbuka, batas 2, tiga BUY)", () => {
  // satu posisi terbuka (BIRB), batas 2 -> hanya SATU klaim baru yang diterima
  let claims: Record<string, number> = {};
  const a = planSlotClaim({ claims, now, pair: "zerebro_idr", openCount: 1, max: 2 });
  assert.equal(a.granted, true);
  claims = a.claims;
  const b = planSlotClaim({ claims, now, pair: "dot_idr", openCount: 1, max: 2 });
  assert.equal(b.granted, false);
  const c = planSlotClaim({ claims: b.claims, now, pair: "avax_idr", openCount: 1, max: 2 });
  assert.equal(c.granted, false);
});

test("slot: klaim kedaluwarsa dilepas otomatis; klaim pair sendiri tidak dihitung ganda", () => {
  const old = { "dot_idr": now - 1 };
  assert.equal(planSlotClaim({ claims: old, now, pair: "x_idr", openCount: 1, max: 2 }).granted, true);
  const own = { "x_idr": now + 10_000 };
  assert.equal(planSlotClaim({ claims: own, now, pair: "x_idr", openCount: 1, max: 2 }).granted, true);
});

test("slot: tanpa posisi terbuka, batas 2 -> dua klaim diterima, ketiga ditolak", () => {
  const r1 = planSlotClaim({ claims: {}, now, pair: "a_idr", openCount: 0, max: 2 });
  const r2 = planSlotClaim({ claims: r1.claims, now, pair: "b_idr", openCount: 0, max: 2 });
  const r3 = planSlotClaim({ claims: r2.claims, now, pair: "c_idr", openCount: 0, max: 2 });
  assert.deepEqual([r1.granted, r2.granted, r3.granted], [true, true, false]);
});

test("engine: ada guard BUY per-pair (state.inPosition) dan klaim/lepas slot live (source guard)", () => {
  const src = readFileSync("src/services/trading/engine.ts", "utf8");
  const buyCase = src.slice(src.indexOf('case "BUY": {'));
  assert.ok(buyCase.indexOf("if (state.inPosition)") > -1 && buyCase.indexOf("if (state.inPosition)") < buyCase.indexOf("RISK_CONFIG.emergencyStop"));
  assert.match(src, /claimBuySlot\(/);
  assert.match(src, /releaseBuySlot\(input\.pair\)/);
  assert.ok(src.indexOf("claimBuySlot(\n") < src.indexOf("await tradingService.buy({"));
});
