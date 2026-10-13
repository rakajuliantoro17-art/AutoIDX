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
export { classify };
export type { PositionRow, PositionStatus };

async function readExchangeBalances(): Promise<(asset: string) => number> {
  const account = await getActiveIndodaxAccount();
  if (!account) throw new Error("Tidak ada akun Indodax aktif.");
  const client = new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey });
  const info = await client.getInfo();
  if (!info.success) throw new Error(`Gagal ambil saldo Indodax: ${info.message}`);
  return (asset) =>
    Number(info.data.balance?.[asset] ?? 0) + Number(info.data.balance_hold?.[asset] ?? 0);
}

export async function checkOpenPositions(): Promise<PositionRow[]> {
  const pairs = await getOpenPositionPairs();
  if (pairs.length === 0) return [];
  const qtyOf = await readExchangeBalances();
  const rows: PositionRow[] = [];
  for (const pair of pairs) {
    const state = await getBotState(pair);
    const exchangeQty = qtyOf(pair.split("_")[0]);
    rows.push({
      pair,
      localQty: state.coinAmount,
      entryPrice: state.entryPrice,
      exchangeQty,
      status: classify(state.coinAmount, exchangeQty),
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
