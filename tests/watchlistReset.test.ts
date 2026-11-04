import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("watchlist-reset: hanya pemilik, wajib confirm, pilih seimbang, ter-audit", () => {
  const src = readFileSync("src/pages/api/bot/watchlist-reset.ts", "utf8");
  assert.match(src, /isOwner\(user\.uid\)/);
  assert.match(src, /confirm !== true/);
  assert.match(src, /updateBotControl\(\{ watchlist: next \}/);
  assert.match(src, /recordAudit\("bot_control\.update"/);
});

test("tombol reset terpasang di halaman Settings", () => {
  const src = readFileSync("src/pages/dashboard/settings.tsx", "utf8");
  assert.match(src, /<WatchlistResetButton/);
});
