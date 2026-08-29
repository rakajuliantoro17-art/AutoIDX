/**
==========================================================
AURA Trade OS
Webhook Service
Version : 0.1.0 Alpha
==========================================================
UPDATE (rancang aksi nyata -- sebelumnya cuma stub, menerima
payload tapi tidak melakukan apa pun): payload.event sekarang
dipetakan ke DispatchJobType (services/automation/dispatcher.ts,
sebelumnya orphan) dan benar-benar dieksekusi.

Event yang didukung:
- "scan" / "run_cycle"      -> siklus scan+trade PENUH (sama
                                persis dengan cron terjadwal),
                                lewat SEMUA risk gate yang ada.
- "pause" / "emergency_stop" -> aktifkan emergency stop (blokir
                                BUY baru, SELL tetap jalan).
- "resume"                   -> matikan emergency stop.
- "status" / "health"        -> cek kesehatan, read-only.

SENGAJA TIDAK ADA event "buy"/"sell": webhook eksternal (yang
keamanannya cuma bergantung pada satu shared secret -- lihat
signature.ts) TIDAK BOLEH memicu order secara langsung. Kalau
secret itu bocor, dampak maksimalnya cuma "trading jadi lebih
konservatif" (pause) atau "siklus yang SUDAH ter-risk-gate
dijalankan lebih awal" -- TIDAK PERNAH "order dieksekusi tanpa
melewati strategi/risk-gate".

Rate limited (services/security/rateLimitStore.ts, Firestore-
based, benar untuk serverless) -- webhook cuma dilindungi shared
secret, tanpa rate limit itu bisa di-spam untuk memicu siklus
scan/trade berulang-ulang atau toggle pause/resume terus-menerus.
==========================================================
*/

import { WebhookPayload } from "./types";
import automationDispatcher, {
  type DispatchJobType,
} from "@/services/automation/dispatcher";
import { checkRateLimit } from "@/services/security/rateLimitStore";

// Aksi yang MENGUBAH STATE (scan/trade, pause/resume) dibatasi
// lebih ketat daripada status check (read-only).
const MUTATING_ACTION_LIMIT = 10;
const MUTATING_ACTION_WINDOW_MS = 5 * 60 * 1000; // 5 menit

const STATUS_ACTION_LIMIT = 60;
const STATUS_ACTION_WINDOW_MS = 5 * 60 * 1000;

export interface WebhookProcessResult {
  received: true;
  source: string;
  event: string;
  action: string;
  processedAt: string;
  rateLimited?: boolean;
  rateLimitMessage?: string;
  result?: unknown;
}

const EVENT_ALIASES: Record<string, DispatchJobType> = {
  scan: "SCAN_MARKET",
  run_cycle: "SCAN_MARKET",
  pause: "PAUSE_TRADING",
  emergency_stop: "PAUSE_TRADING",
  resume: "RESUME_TRADING",
  status: "HEALTH_CHECK",
  health: "HEALTH_CHECK",
};

const MUTATING_JOB_TYPES = new Set<DispatchJobType>([
  "SCAN_MARKET",
  "PAUSE_TRADING",
  "RESUME_TRADING",
]);

export async function processWebhook(
  payload: WebhookPayload
): Promise<WebhookProcessResult> {
  const normalizedEvent = payload.event.trim().toLowerCase();
  const jobType = EVENT_ALIASES[normalizedEvent];

  const processedAt = new Date().toISOString();

  if (!jobType) {
    // Event tidak dikenali -- tetap diterima (200), tapi tidak ada
    // aksi yang dijalankan. Ini BUKAN error: source webhook (mis.
    // TradingView) mungkin kirim banyak jenis alert, kita cuma
    // bertindak untuk yang kita kenali.
    return {
      received: true,
      source: payload.source,
      event: payload.event,
      action: "IGNORED_UNKNOWN_EVENT",
      processedAt,
    };
  }

  const isMutating = MUTATING_JOB_TYPES.has(jobType);

  const rateLimitKey = isMutating
    ? `webhook:mutating:${payload.source}`
    : `webhook:status:${payload.source}`;

  const rateLimit = await checkRateLimit(
    rateLimitKey,
    isMutating ? MUTATING_ACTION_LIMIT : STATUS_ACTION_LIMIT,
    isMutating ? MUTATING_ACTION_WINDOW_MS : STATUS_ACTION_WINDOW_MS
  );

  if (!rateLimit.allowed) {
    return {
      received: true,
      source: payload.source,
      event: payload.event,
      action: "RATE_LIMITED",
      processedAt,
      rateLimited: true,
      rateLimitMessage: rateLimit.message,
    };
  }

  const job = automationDispatcher.createJob(jobType, {
    triggeredBy: `webhook:${payload.source}`,
  });

  const dispatchResult = await automationDispatcher.dispatch(job);

  return {
    received: true,
    source: payload.source,
    event: payload.event,
    action: jobType,
    processedAt,
    result: dispatchResult,
  };
}
