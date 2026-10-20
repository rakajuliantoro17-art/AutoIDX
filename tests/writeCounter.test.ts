import { test } from "node:test";
import assert from "node:assert/strict";
import { Firestore } from "firebase-admin/firestore";
import {
  installWriteCounter,
  resetWriteCounts,
  getWriteCounts,
} from "../src/services/firebase/writeCounter";

const fs = new Firestore({ projectId: "test-project", ssl: false, host: "localhost:1" });

test("menghitung write dan delete per koleksi, tanpa mengubah perilaku batch", () => {
  installWriteCounter();
  installWriteCounter(); // idempoten: tidak boleh menghitung ganda
  resetWriteCounts();

  const batch = fs.batch();
  const ret = batch.set(fs.collection("logs").doc("a"), { x: 1 });
  batch.set(fs.collection("logs").doc("b"), { x: 2 });
  batch.update(fs.collection("state").doc("p"), { y: 1 });
  batch.delete(fs.collection("logs").doc("c"));
  batch.create(fs.collection("a").doc("b").collection("entries").doc("z"), { k: 1 });

  assert.equal(ret, batch, "method asli tetap mengembalikan batch (chaining)");
  assert.deepEqual(getWriteCounts(), {
    "write:logs": 2,
    "del:logs": 1,
    "write:state": 1,
    "write:a/b/entries": 1,
  });
});

test("reset mengosongkan hitungan", () => {
  resetWriteCounts();
  assert.deepEqual(getWriteCounts(), {});
});
