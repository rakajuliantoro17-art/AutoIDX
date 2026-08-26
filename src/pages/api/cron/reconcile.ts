/**
==========================================================
AURA Trade OS
Cron: Position Reconciliation (Live Mode Safety Check)
Version : 0.1.0 Alpha

Mengaktifkan services/reconciliation/* yang sebelumnya orphan
(tidak pernah diimpor dari mana pun -- BUKAN folder yang sama
dengan services/liveTrading/reconciliation/, yang juga orphan
terpisah). ReconciliationEngine itu sendiri murni fungsi
pembanding (local vs exchange, generic) -- file ini yang
menyediakan data ASLI-nya: posisi tercatat di bot_state
(Firestore) dibandingkan dengan saldo koin SEBENARNYA di akun
Indodax (via IndodaxClient.getInfo(), API yang sama dipakai
services/trading/engine.ts untuk cek saldo live).

Kenapa ini penting: TradingEngine SELALU percaya bot_state
sebagai representasi posisi yang benar (entryPrice, coinAmount,
SL/TP). Kalau order live gagal tercatat dengan benar (mis. error
jaringan setelah order Indodax berhasil, tapi sebelum
updateBotState sempat jalan), bot_state bisa "buta" terhadap
posisi yang sebenarnya ada -- atau sebaliknya, mengira masih
pegang koin yang sebenarnya sudah tidak ada. Reconciliation ini
mendeteksi celah itu secara berkala.

CATATAN CAKUPAN (jujur soal keterbatasan):
- Cuma POSITION (jumlah koin per pair) yang dibandingkan.
  BALANCE (saldo IDR) TIDAK dibandingkan -- mode live tidak
  punya "buku besar IDR lokal" terpisah (langsung percaya saldo
  Indodax asli di setiap risk-check), jadi tidak ada angka
  "local" yang bermakna untuk dibandingkan.
- unknownOrderIds sekarang diisi lewat IndodaxClient.openOrders()
  (sebelumnya SELALU kosong) -- TAPI cakupannya cuma pair yang
  sedang ada di openPositionPairs (bot_state). Order nyasar di
  pair yang bot SUDAH TIDAK punya posisi tercatat (mis. exit
  sebelumnya gagal update bot_state) TIDAK akan terdeteksi --
  butuh scan semua pair Indodax yang di luar cakupan perbaikan
  ini (mahal secara rate-limit kalau dilakukan tiap siklus).
- HANYA berjalan kalau mode LIVE benar-benar aktif (dua syarat:
  bot_control.mode==="live" DAN BOT_LIVE_CONFIRM==="true", sama
  seperti isLiveModeActive() di engine.ts). Di paper mode,
  reconciliation tidak bermakna (local & "exchange" sama-sama
  simulasi).

Kalau ditemukan mismatch dan haltOnMismatch=true (default),
emergency stop diaktifkan otomatis lewat updateBotControl() --
mem-blokir BUY baru (SELL/exit tetap jalan seperti biasa, sesuai
desain emergency stop di seluruh sistem ini) sampai investigasi
manual. Notifikasi Telegram/console dikirim lewat
automationNotifier yang sudah aktif sebelumnya.

Trigger: cron-job.org terpisah dari /api/cron/scan (atau bisa
dipanggil manual), Authorization: Bearer <CRON_SECRET> -- header
yang SAMA dengan /api/cron/scan.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";

import { ReconciliationEngine } from "@/services/reconciliation/reconciliationEngine";
import { createReconciliationConfig } from "@/services/reconciliation/reconciliationConfig";
import type { ReconciliationContext, PositionSnapshot } from "@/services/reconciliation/reconciliationContext";

import { getBotControl, updateBotControl } from "@/services/firebase/botControl";
import { getBotState, getOpenPositionPairs } from "@/services/firebase/botState";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";
import { recordLog } from "@/services/firebase/logService";
import { recordReconciliationStatus } from "@/services/firebase/reconciliationStatus";
import { getCronHeartbeatStatus } from "@/services/scheduler/cronHeartbeat";
import automationNotifier from "@/services/automation/notifier";
import { auditLogger } from "@/services/audit/firestoreAudit";
import { handleError } from "@/services/errors/errorHandler";
import { SafetyGate } from "@/services/safety/safetyGate";
import { createSafetyConfig } from "@/services/safety/safetyConfig";
import type { SafetyContext } from "@/services/safety/safetyContext";

/**
 * Sama seperti cron/scan.ts -- default timeout Vercel Hobby (10
 * detik) berisiko mepet kalau posisi terbuka banyak (tiap pair
 * butuh panggilan getInfo()+openOrders() terpisah ke Indodax).
 */
export const config = {
  maxDuration: 60,
};

/**
 * Live trading HANYA aktif kalau DUA syarat terpenuhi -- sama
 * persis isLiveModeActive() di services/trading/engine.ts.
 * Sengaja diduplikasi (bukan diimpor) supaya file ini tidak
 * menambah dependency ke engine.ts yang sudah besar.
 */
function isLiveModeActive(control: { mode: "paper" | "live" }): boolean {
  return (
    control.mode === "live" &&
    process.env.BOT_LIVE_CONFIRM === "true"
  );
}

/**
 * Bangun SafetyContext dari hasil ReconciliationEngine -- dipakai
 * SafetyGate (services/safety/safetyGate.ts, murni stateless) untuk
 * memutuskan ALLOW/HALT/MANUAL_RECOVERY yang lebih bernuansa
 * daripada logika lama ("ada mismatch apa saja -> langsung
 * emergency stop").
 *
 * CATATAN JUJUR soal cakupan: dailyPnlPct dan
 * consecutiveExecutionErrors belum ada sumber data real-time yang
 * terhubung di titik ini (dailyPnlPct sudah dicek terpisah di
 * risk-gate BUY engine.ts; consecutiveExecutionErrors belum
 * dilacak di mana pun) -- keduanya sengaja diisi 0 (netral, tidak
 * memicu HALT) daripada dikarang. staleOrders juga 0 karena bot
 * ini SELALU pakai market order (fill instan, tidak pernah
 * "menggantung").
 */
function buildSafetyContext(
  mismatches: readonly { type: "BALANCE" | "POSITION" | "ORDER"; local?: number; exchange?: number }[],
  unknownOrderCount: number
): SafetyContext {

  const percentDeviation = (local?: number, exchange?: number): number => {

    if (local === undefined || exchange === undefined) {
      return 0;
    }

    const base = Math.max(Math.abs(exchange), 1e-8);

    return Math.abs(local - exchange) / base;

  };

  const balanceMismatchPct = Math.max(
    0,
    ...mismatches
      .filter((m) => m.type === "BALANCE")
      .map((m) => percentDeviation(m.local, m.exchange))
  );

  const positionMismatchPct = Math.max(
    0,
    ...mismatches
      .filter((m) => m.type === "POSITION")
      .map((m) => percentDeviation(m.local, m.exchange))
  );

  return {
    timestamp: Date.now(),
    dailyPnlPct: 0,
    unknownOrders: unknownOrderCount,
    consecutiveExecutionErrors: 0,
    balanceMismatchPct,
    positionMismatchPct,
    staleOrders: 0,
  };

}

async function buildLiveReconciliationContext(): Promise<ReconciliationContext> {

  const openPairs = await getOpenPositionPairs();

  const account = await getActiveIndodaxAccount();

  if (!account) {
    throw new Error("Tidak ada akun Indodax aktif -- tidak bisa rekonsiliasi.");
  }

  const client = new IndodaxClient({
    apiKey: account.apiKey,
    secretKey: account.secretKey,
  });

  const info = await client.getInfo();

  if (!info.success) {
    throw new Error(`Gagal ambil saldo Indodax: ${info.message}`);
  }

  const positions: PositionSnapshot[] = [];
  const unknownOrderIds: string[] = [];

  for (const pair of openPairs) {

    const state = await getBotState(pair);

    const baseAsset = pair.split("_")[0];

    const exchangeQuantity = Number(info.data.balance[baseAsset] ?? 0);

    positions.push({
      symbol: pair,
      localQuantity: state.coinAmount,
      exchangeQuantity,
    });

    // --- Open order asli di Indodax (sebelumnya SELALU kosong --
    // IndodaxClient belum punya method untuk ini). Bot ini SELALU
    // market order (fill instan), jadi order yang masih OPEN di
    // sini pada dasarnya "tidak dikenal" bot -- lihat catatan
    // lengkap di IndodaxClient.openOrders(). Kegagalan cek open
    // order untuk satu pair TIDAK menggagalkan reconciliation
    // pair lain -- dicatat sebagai warning, bukan error fatal. ---
    try {

      const openOrders = await client.openOrders(pair);

      if (openOrders.success) {

        for (const order of openOrders.data) {
          unknownOrderIds.push(`${pair}:${order.order_id}`);
        }

      }

    } catch (error) {

      console.warn(
        `[Reconciliation] Gagal cek open order ${pair} (dilewati):`,
        error
      );

    }

  }

  return {
    timestamp: Date.now(),
    balances: [],
    positions,
    unknownOrderIds,
  };

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const authHeader = req.headers.authorization;
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    // --- Cross-monitor cron scan.ts -------------------------------
    // reconcile.ts biasanya dijadwalkan terpisah (interval lebih
    // jarang) dari cron/scan.ts -- dipakai di sini untuk "saling
    // mengawasi": kalau trigger eksternal scan.ts berhenti menembak
    // (STALE/DEAD), reconcile.ts yang masih jalan akan membunyikan
    // notifikasi. Best-effort, TIDAK menghentikan reconciliation
    // di bawahnya walau notifikasi gagal terkirim.
    const scanHeartbeat = await getCronHeartbeatStatus();

    if (scanHeartbeat.status !== "ALIVE") {

      const ageMinutes =
        scanHeartbeat.ageMs !== null
          ? Math.round(scanHeartbeat.ageMs / 60_000)
          : null;

      const heartbeatMessage =
        scanHeartbeat.status === "DEAD" && scanHeartbeat.lastRunAt === null
          ? "cron/scan.ts belum pernah tercatat jalan sama sekali sejak fitur heartbeat aktif."
          : `cron/scan.ts terakhir sukses ${ageMinutes} menit lalu (status: ${scanHeartbeat.status}). ` +
            `Market scan, stop-loss/take-profit otomatis, dan trading engine TIDAK BERJALAN selama ini.`;

      await recordLog(
        "SYSTEM",
        scanHeartbeat.status === "DEAD" ? "danger" : "warning",
        `[Cron Heartbeat] ${heartbeatMessage}`
      );

      await automationNotifier.warning(
        "Cron Scan Tidak Responsif",
        heartbeatMessage
      );

    }

    const control = await getBotControl();

    if (!isLiveModeActive(control)) {

      return res.status(200).json({
        success: true,
        skipped: true,
        reason: "Bukan mode live aktif -- reconciliation dilewati (tidak bermakna untuk paper trading).",
        executedAt: new Date().toISOString(),
      });

    }

    const context = await buildLiveReconciliationContext();

    const config = createReconciliationConfig({
      tolerancePct: 0.02,
      haltOnMismatch: true,
    });

    const engine = new ReconciliationEngine(config);

    const result = engine.compare(context);

    if (result.consistent) {

      await recordLog(
        "SYSTEM",
        "success",
        `[Reconciliation] Konsisten -- ${context.positions.length} posisi dicocokkan dengan saldo Indodax asli, tidak ada mismatch.`
      );

      await recordReconciliationStatus({
        consistent: true,
        positionsChecked: context.positions.length,
        mismatchCount: 0,
      });

      return res.status(200).json({
        success: true,
        consistent: true,
        positionsChecked: context.positions.length,
        executedAt: new Date().toISOString(),
      });

    }

    const mismatchSummary = result.mismatches
      .map((m) => `${m.type} ${m.key}: local=${m.local ?? "-"} exchange=${m.exchange ?? "-"} (${m.message})`)
      .join(" | ");

    await recordLog(
      "SYSTEM",
      "danger",
      `[Reconciliation] MISMATCH ditemukan: ${mismatchSummary}`
    );

    for (const mismatch of result.mismatches) {

      const auditType =
        mismatch.type === "BALANCE"
          ? "BALANCE_MISMATCH"
          : mismatch.type === "POSITION"
            ? "POSITION_MISMATCH"
            : "ORDER_UNKNOWN";

      await auditLogger.log(
        auditType,
        `${mismatch.type} mismatch ${mismatch.key}: local=${mismatch.local ?? "-"} exchange=${mismatch.exchange ?? "-"}`,
        {
          symbol: mismatch.type !== "BALANCE" ? mismatch.key : undefined,
          orderId: mismatch.type === "ORDER" ? mismatch.key : undefined,
          metadata: {
            local: mismatch.local,
            exchange: mismatch.exchange,
            message: mismatch.message,
          },
        }
      );

    }

    await automationNotifier.error(
      "Reconciliation Mismatch",
      `Posisi bot_state TIDAK cocok dengan saldo Indodax asli:\n${mismatchSummary}`
    );

    // --- SafetyGate: keputusan ALLOW/HALT/MANUAL_RECOVERY yang
    // lebih bernuansa, menggantikan logika lama "ada mismatch apa
    // saja -> langsung emergency stop". SafetyGate murni stateless
    // (aman dipanggil fresh tiap request serverless) -- BEDA
    // dengan SafetyManager pembungkusnya yang simpan status di
    // memori instance (tidak dipakai di sini karena tidak akan
    // bertahan antar-invocation Vercel).
    const safetyGate = new SafetyGate(createSafetyConfig());

    const safetyContext = buildSafetyContext(
      result.mismatches,
      context.unknownOrderIds.length
    );

    const safetyDecision = safetyGate.evaluate(safetyContext);

    const shouldHalt =
      config.haltOnMismatch && safetyDecision.action !== "ALLOW";

    if (shouldHalt) {

      await updateBotControl(
        { emergencyStop: true },
        "reconciliation-guard"
      );

      const recoveryNote =
        safetyDecision.action === "MANUAL_RECOVERY"
          ? "Butuh RECOVERY MANUAL oleh operator (bukan sekadar tunggu siklus berikutnya) -- lihat detail mismatch di atas sebelum menonaktifkan emergency stop."
          : "Emergency stop diaktifkan otomatis -- BUY baru diblokir sampai diperiksa manual.";

      await automationNotifier.error(
        `Safety Gate: ${safetyDecision.action}`,
        `${recoveryNote}\nAlasan: ${safetyDecision.reasons.join(", ")}`
      );

      await auditLogger.log(
        "SAFETY_HALT",
        `Safety gate memutuskan ${safetyDecision.action} -- ${safetyDecision.reasons.join(", ")}`,
        {
          metadata: {
            action: safetyDecision.action,
            reasons: safetyDecision.reasons,
            context: safetyContext,
            mismatchCount: result.mismatches.length,
          },
        }
      );

    }

    await recordReconciliationStatus({
      consistent: false,
      positionsChecked: context.positions.length,
      mismatchCount: result.mismatches.length,
    });

    return res.status(200).json({
      success: true,
      consistent: false,
      mismatches: result.mismatches,
      safetyDecision,
      emergencyStopActivated: shouldHalt,
      executedAt: new Date().toISOString(),
    });

  } catch (error) {

    const handled = handleError(error, {
      source: "cron/reconcile",
    });

    await recordLog(
      "SYSTEM",
      "danger",
      `[Reconciliation] Gagal jalan [${handled.category}${handled.retryable ? ", retryable" : ""}]: ${handled.error.message}`
    );

    return res.status(500).json({
      error: handled.error.message,
      category: handled.category,
      retryable: handled.retryable,
    });

  }

}
