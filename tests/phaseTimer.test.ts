import test from "node:test";
import assert from "node:assert/strict";
import { PhaseTimer } from "../src/services/trading/phaseTimer";

test("PhaseTimer: ringkasan selisih antar tahap dan total", () => {
  const t = new PhaseTimer(1000);
  t.mark("getClient", 1120);
  t.mark("getInfo", 3420);
  t.mark("trade", 3500);
  assert.equal(t.summary(), "getClient=120ms getInfo=2300ms trade=80ms");
  assert.equal(t.totalMs(4000), 3000);
});

test("live.ts memakai PhaseTimer di BUY dan SELL (source guard)", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync("src/services/trading/live.ts", "utf8");
  assert.equal((src.match(/new PhaseTimer\(\)/g) ?? []).length, 2);
  assert.match(src, /\[LATENSI LAMBAT\] BUY/);
  assert.match(src, /\[LATENSI LAMBAT\] SELL/);
});
