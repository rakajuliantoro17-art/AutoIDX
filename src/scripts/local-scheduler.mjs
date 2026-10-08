#!/usr/bin/env node
/**
 * AURA Trade OS -- Local Scheduler (untuk server fisik / VPS)
 *
 * Pengganti cron-job.org / GitHub Actions saat aplikasi dijalankan
 * dengan `next start` di server sendiri. Murni memanggil endpoint
 * HTTP yang SAMA (/api/cron/scan dan /api/cron/reconcile) dengan
 * header Bearer CRON_SECRET, jadi logika, lock, dan heartbeat
 * identik dengan mode serverless. Tanpa dependency tambahan.
 *
 * Env:
 *   CRON_SECRET                       (wajib) sama dengan server
 *   APP_BASE_URL                      default http://127.0.0.1:3000
 *   SCHEDULER_SCAN_INTERVAL_SECONDS   default 60  (min 10)
 *   SCHEDULER_RECONCILE_INTERVAL_SECONDS default 900 (min 60)
 *   SCHEDULER_REQUEST_TIMEOUT_SECONDS default 120
 *
 * Jalankan (contoh PM2):
 *   pm2 start scripts/local-scheduler.mjs --name autoidx-scheduler
 * atau systemd/Docker dengan perintah: node scripts/local-scheduler.mjs
 *
 * Catatan: interval scan yang efektif tetap dibatasi
 * CRON_SCAN_MIN_INTERVAL_SECONDS di sisi server (lock/throttle).
 */

const secret = process.env.CRON_SECRET?.trim();

if (!secret) {
  console.error("[SCHEDULER] CRON_SECRET belum di-set. Berhenti.");
  process.exit(1);
}

const baseUrl = (process.env.APP_BASE_URL ?? "http://127.0.0.1:3000").replace(/\/+$/, "");

function seconds(name, fallback, min) {
  const raw = Number(process.env[name]);
  const value = Number.isFinite(raw) && raw > 0 ? raw : fallback;
  return Math.max(min, value) * 1000;
}

const scanEveryMs = seconds("SCHEDULER_SCAN_INTERVAL_SECONDS", 60, 10);
const reconcileEveryMs = seconds("SCHEDULER_RECONCILE_INTERVAL_SECONDS", 900, 60);
const timeoutMs = seconds("SCHEDULER_REQUEST_TIMEOUT_SECONDS", 120, 10);

const running = new Set();
let stopping = false;

async function call(name, path) {
  // Jangan menumpuk panggilan jika yang sebelumnya belum selesai.
  if (stopping || running.has(name)) return;
  running.add(name);

  const started = Date.now();
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
    console.log(`[SCHEDULER] ${name} -> HTTP ${res.status} (${Date.now() - started} ms)`);
  } catch (error) {
    console.error(`[SCHEDULER] ${name} gagal: ${error instanceof Error ? error.message : error}`);
  } finally {
    running.delete(name);
  }
}

const timers = [
  setInterval(() => call("scan", "/api/cron/scan"), scanEveryMs),
  setInterval(() => call("reconcile", "/api/cron/reconcile"), reconcileEveryMs),
];

console.log(
  `[SCHEDULER] Mulai. base=${baseUrl} scan=${scanEveryMs / 1000}s reconcile=${reconcileEveryMs / 1000}s`
);

call("scan", "/api/cron/scan");

function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`[SCHEDULER] ${signal} diterima, berhenti.`);
  timers.forEach(clearInterval);
  setTimeout(() => process.exit(0), 1000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
