import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { persistWithRetry } from "../src/services/trading/persistFill";

const noSleep = async () => {};

test("berhasil di percobaan pertama", async () => {
  const r = await persistWithRetry(async () => true, { sleep: noSleep });
  assert.deepEqual(r, { ok: true, attempts: 1 });
});

test("false lalu berhasil: dicoba ulang", async () => {
  let n = 0;
  const r = await persistWithRetry(async () => ++n >= 3, { sleep: noSleep });
  assert.equal(r.ok, true);
  assert.equal(r.attempts, 3);
});

test("selalu gagal (false atau throw): ok=false dengan pesan", async () => {
  const a = await persistWithRetry(async () => false, { sleep: noSleep });
  assert.equal(a.ok, false);
  assert.equal(a.attempts, 3);
  const b = await persistWithRetry(async () => { throw new Error("quota"); }, { sleep: noSleep });
  assert.equal(b.ok, false);
  assert.equal(b.error, "quota");
});

test("engine BUY memakai persistWithRetry dan emergency stop saat gagal", () => {
  const src = readFileSync("src/services/trading/engine.ts", "utf8");
  assert.match(src, /persistWithRetry\(\(\) =>/);
  assert.match(src, /STATE GAGAL TERSIMPAN/);
  assert.match(src, /updateBotControl\(\{ emergencyStop: true \}/);
});
