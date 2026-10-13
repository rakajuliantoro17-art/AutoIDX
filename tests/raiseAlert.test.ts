import test from "node:test";
import assert from "node:assert/strict";
import { formatAlertMessage, ALERT_LOG_PATTERN, ALERT_COOLDOWN_MS } from "../src/services/alerts/raiseAlert";

test("format pesan memuat penanda jenis yang dikenali lonceng", () => {
  const m = formatAlertMessage("ORDER_BREAKER", "Pemutus order aktif", "3 kegagalan");
  assert.match(m, ALERT_LOG_PATTERN);
  assert.ok(m.startsWith("[ALERT:ORDER_BREAKER]"));
});
test("log biasa tidak dianggap peringatan", () => {
  assert.equal(ALERT_LOG_PATTERN.test("LIVE BUY GAGAL btc_idr"), false);
});
test("cooldown 30 menit", () => assert.equal(ALERT_COOLDOWN_MS, 1_800_000));
