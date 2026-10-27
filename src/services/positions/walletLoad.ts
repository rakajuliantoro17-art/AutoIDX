/** Muat isi dompet Indodax + klasifikasi vs catatan bot (server-only, BACA-SAJA). */
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { getBotState, getOpenPositionPairs } from "@/services/firebase/botState";
import { IndodaxClient } from "@/services/liveTrading/exchange/indodaxClient";
import { getUnmanagedHoldings } from "./unmanaged";
import { classifyHoldings, type HoldingRow } from "./walletReport";

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export interface LoadedWallet {
  client: IndodaxClient;
  idr: { available: number; hold: number };
  rows: HoldingRow[];
}

export async function loadWallet(): Promise<LoadedWallet> {
  const account = await getActiveIndodaxAccount();
  if (!account) throw new Error("Tidak ada akun Indodax aktif.");
  const client = new IndodaxClient({ apiKey: account.apiKey, secretKey: account.secretKey, v2ApiKey: account.v2ApiKey, v2SecretKey: account.v2SecretKey });
  const info = await client.getInfo();
  if (!info.success) throw new Error(`Gagal ambil saldo Indodax: ${info.message}`);

  const balance = (info.data.balance ?? {}) as Record<string, unknown>;
  const hold = (info.data.balance_hold ?? {}) as Record<string, unknown>;
  const totals: Record<string, number> = {};
  for (const k of new Set([...Object.keys(balance), ...Object.keys(hold)])) {
    totals[k] = num(balance[k]) + num(hold[k]);
  }

  const open: Record<string, number> = {};
  for (const pair of await getOpenPositionPairs()) {
    const st = await getBotState(pair);
    const asset = pair.split("_")[0];
    open[asset] = (open[asset] ?? 0) + st.coinAmount;
  }

  return {
    client,
    idr: { available: num(balance.idr), hold: num(hold.idr) },
    rows: classifyHoldings({ balances: totals, open, unmanaged: await getUnmanagedHoldings() }),
  };
}
