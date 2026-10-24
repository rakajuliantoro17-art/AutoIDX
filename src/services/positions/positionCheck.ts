/**
 * Pemeriksaan posisi bot (bot_state) terhadap saldo koin ASLI di Indodax,
 * plus pembersihan "posisi hantu" (bot mencatat posisi, Indodax tidak punya
 * koinnya -- biasanya sisa mode paper). Khusus pemilik; pembersihan selalu
 * memverifikasi ulang saldo di server dan tercatat di audit_logs.
 */
import { getBotState, getOpenPositionPairs, updateBotState } from "@/services/firebase/botState";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";

import { classify, type PositionRow, type PositionStatus } from "./positionClassify";
import { addUnmanagedHolding, canReleaseStuck, getUnmanagedHoldings, subtractUnmanaged } from "./unmanaged";
export { classify };
export type { PositionRow, PositionStatus };

async function readExchangeBalances(): Promise<(asset: string) => number> {
  const account = await getActiveIndodaxAccount();
  if (!account) throw new Error("Tidak ada akun Indodax aktif.");
  const client = new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey });
  const info = await client.getInfo();
  if (!info.success) throw new Error(`Gagal ambil saldo Indodax: ${info.message}`);
  const unmanaged = await getUnmanagedHoldings();
  return (asset) =>
    subtractUnmanaged(
      Number(info.data.balance?.[asset] ?? 0) + Number(info.data.balance_hold?.[asset] ?? 0),
      unmanaged[asset] ?? 0
    );
}

async function readLastPrice(pair: string): Promise<number> {
  const account = await getActiveIndodaxAccount();
  if (!account) return 0;
  const client = new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey });
  const r = await client.publicRequest(`ticker/${pair.replace("_", "")}`);
  const last = Number((r.data as { ticker?: { last?: string } } | null)?.ticker?.last);
  return r.success && Number.isFinite(last) ? last : 0;
}

export async function checkOpenPositions(): Promise<PositionRow[]> {
  const pairs = await getOpenPositionPairs();
  if (pairs.length === 0) return [];
  const qtyOf = await readExchangeBalances();
  const rows: PositionRow[] = [];
  for (const pair of pairs) {
    const state = await getBotState(pair);
    const exchangeQty = qtyOf(pair.split("_")[0]);
    const price = await readLastPrice(pair).catch(() => 0);
    const release = canReleaseStuck({ localQty: state.coinAmount, exchangeQty, price });
    rows.push({
      pair,
      localQty: state.coinAmount,
      entryPrice: state.entryPrice,
      exchangeQty,
      status: classify(state.coinAmount, exchangeQty),
      valueIdr: price > 0 ? Math.round(state.coinAmount * price) : undefined,
      releasable: release.ok,
    });
  }
  return rows;
}

export interface ClearResult {
  ok: boolean;
  message: string;
  before?: { localQty: number; entryPrice: number; exchangeQty: number };
}

/** Bersihkan HANYA posisi hantu (saldo Indodax terverifikasi kosong). */
export async function clearGhostPosition(pair: string): Promise<ClearResult> {
  if (!/^[a-z0-9]+_idr$/.test(pair)) return { ok: false, message: "Format pair tidak valid." };
  const open = await getOpenPositionPairs();
  if (!open.includes(pair)) return { ok: false, message: "Pair itu tidak tercatat sebagai posisi terbuka." };

  const state = await getBotState(pair);
  const exchangeQty = (await readExchangeBalances())(pair.split("_")[0]);
  const before = { localQty: state.coinAmount, entryPrice: state.entryPrice, exchangeQty };

  if (classify(state.coinAmount, exchangeQty) !== "HANTU") {
    return {
      ok: false,
      message: "Saldo koin masih ada di Indodax -- bukan posisi hantu, tidak dibersihkan. Jual manual atau periksa dulu.",
      before,
    };
  }

  const saved = await updateBotState({
    pair,
    inPosition: false,
    entryPrice: 0,
    coinAmount: 0,
    strategyAtEntry: "",
  });
  if (!saved) return { ok: false, message: "Gagal menyimpan ke bot_state.", before };
  return { ok: true, message: "Posisi hantu dibersihkan.", before };
}

export interface ReleaseResult {
  ok: boolean;
  message: string;
  valueIdr?: number;
  qty?: number;
}

/**
 * Lepaskan posisi yang tersangkut di bawah minimum order dari kelolaan bot:
 * tidak ada order dikirim, koin tetap di dompet, dicatat sebagai
 * "di luar kelolaan" agar rekonsiliasi tidak menganggapnya selisih.
 */
export async function releaseStuckPosition(pair: string): Promise<ReleaseResult> {
  if (!/^[a-z0-9]+_idr$/.test(pair)) return { ok: false, message: "Format pair tidak valid." };
  const open = await getOpenPositionPairs();
  if (!open.includes(pair)) return { ok: false, message: "Pair itu tidak tercatat sebagai posisi terbuka." };

  const state = await getBotState(pair);
  const asset = pair.split("_")[0];
  const exchangeQty = (await readExchangeBalances())(asset);
  const price = await readLastPrice(pair);
  const check = canReleaseStuck({ localQty: state.coinAmount, exchangeQty, price });
  if (!check.ok) return { ok: false, message: check.reason ?? "Tidak memenuhi syarat.", valueIdr: Math.round(check.valueIdr) };

  await addUnmanagedHolding(asset, state.coinAmount);
  const saved = await updateBotState({
    pair,
    inPosition: false,
    entryPrice: 0,
    coinAmount: 0,
    strategyAtEntry: "",
  });
  if (!saved) return { ok: false, message: "Gagal menyimpan ke bot_state (catatan 'di luar kelolaan' sudah ditambahkan; cek manual)." };
  return {
    ok: true,
    message: `Posisi ${pair.toUpperCase()} dilepas dari bot. ${state.coinAmount} ${asset.toUpperCase()} tetap di dompet Indodax.`,
    valueIdr: Math.round(check.valueIdr),
    qty: state.coinAmount,
  };
}
