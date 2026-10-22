import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Koleksi "trades" dipakai bersama paper & live; tampilan Live harus memfilter mode=live.
for (const file of ["src/pages/api/portfolio/summary.ts", "src/pages/api/trades/history.ts"]) {
  test(`${file}: jalur live hanya membaca trade mode=live`, () => {
    const src = readFileSync(file, "utf8");
    assert.match(src, /\.collection\("trades"\)\s*\.where\("mode", "==", "live"\)/);
    assert.doesNotMatch(src, /\.collection\("trades"\)\s*\.orderBy/);
  });
}
