import test from "node:test";
import assert from "node:assert/strict";
import { shouldRunEvery, claimInterval } from "../src/lib/cache/interval";

test("belum pernah jalan -> boleh", () => assert.equal(shouldRunEvery(0, 1000, 600), true));
test("belum sampai interval -> tidak", () => assert.equal(shouldRunEvery(1000, 1500, 600), false));
test("tepat interval -> boleh", () => assert.equal(shouldRunEvery(1000, 1600, 600), true));
test("claimInterval: sekali per interval", () => {
  assert.equal(claimInterval("t", 600_000, 1_000_000), true);
  assert.equal(claimInterval("t", 600_000, 1_300_000), false);
  assert.equal(claimInterval("t", 600_000, 1_600_000), true);
});
test("claimInterval: key berbeda independen", () => {
  assert.equal(claimInterval("a", 1000, 5000), true);
  assert.equal(claimInterval("b", 1000, 5000), true);
});
