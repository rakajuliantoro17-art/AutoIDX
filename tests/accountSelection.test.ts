import test from "node:test";
import assert from "node:assert/strict";
import {
  pickActiveAccount, activeStateForNewAccount, planActivation,
  deletionChangesActiveAccount, evaluateAccountSwitch, type AccountLite,
} from "../src/services/accounts/accountSelection";

const A = (id: string, isActive: boolean, createdAt: number): AccountLite => ({ id, isActive, createdAt });

test("pickActiveAccount: deterministik (tertua) dan menandai ambigu", () => {
  const r = pickActiveAccount([A("b", true, 20), A("a", true, 10), A("c", false, 5)]);
  assert.equal(r.account?.id, "a");
  assert.equal(r.ambiguous, true);
  assert.deepEqual(pickActiveAccount([A("x", false, 1)]), { account: null, ambiguous: false });
});

test("akun baru aktif hanya bila belum ada yang aktif", () => {
  assert.equal(activeStateForNewAccount([]), true);
  assert.equal(activeStateForNewAccount([A("a", false, 1)]), true);
  assert.equal(activeStateForNewAccount([A("a", true, 1)]), false);
});

test("mengaktifkan satu akun menonaktifkan yang lain (satu rencana)", () => {
  const p = planActivation([A("a", true, 1), A("b", false, 2)], "b", true);
  assert.ok(p.ok);
  if (p.ok) {
    assert.deepEqual(p.updates.sort((x, y) => x.id.localeCompare(y.id)), [
      { id: "a", isActive: false }, { id: "b", isActive: true },
    ]);
    assert.equal(p.changesActiveAccount, true);
  }
});

test("merapikan data lama (2 akun aktif) menyisakan satu", () => {
  const p = planActivation([A("a", true, 1), A("b", true, 2)], "b", true);
  assert.ok(p.ok);
  if (p.ok) assert.deepEqual(p.updates, [{ id: "a", isActive: false }]);
});

test("aktifkan akun yang sudah satu-satunya aktif: tanpa perubahan; id tak dikenal ditolak", () => {
  const p = planActivation([A("a", true, 1), A("b", false, 2)], "a", true);
  assert.ok(p.ok && p.updates.length === 0 && !p.changesActiveAccount);
  assert.equal(planActivation([A("a", true, 1)], "zzz", true).ok, false);
});

test("menonaktifkan akun aktif = mengubah akun aktif", () => {
  const p = planActivation([A("a", true, 1)], "a", false);
  assert.ok(p.ok && p.changesActiveAccount);
});

test("hapus: hanya berdampak bila akun yang dihapus adalah akun aktif", () => {
  const acc = [A("a", true, 1), A("b", false, 2)];
  assert.equal(deletionChangesActiveAccount(acc, "b"), false);
  assert.equal(deletionChangesActiveAccount(acc, "a"), true);
});

test("evaluateAccountSwitch: UNCERTAIN, posisi live, gagal baca, dan kasus aman", () => {
  assert.equal(evaluateAccountSwitch({ liveMode: false, openPositions: 0, uncertainLocks: 1 }).allowed, false);
  assert.equal(evaluateAccountSwitch({ liveMode: true, openPositions: 1, uncertainLocks: 0 }).allowed, false);
  assert.equal(evaluateAccountSwitch({ liveMode: false, openPositions: Number.MAX_SAFE_INTEGER, uncertainLocks: 0 }).allowed, false);
  assert.equal(evaluateAccountSwitch({ liveMode: false, openPositions: 3, uncertainLocks: 0 }).allowed, true);
  assert.equal(evaluateAccountSwitch({ liveMode: true, openPositions: 0, uncertainLocks: 0 }).allowed, true);
});
