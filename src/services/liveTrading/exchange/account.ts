/**
==========================================================
AURA Trade OS
Live Trading Exchange Account
Version : 0.2.0 Alpha

Perubahan dari 0.1.0:
- SEBELUMNYA class ini memakai singleton `indodaxClient` yang
  default-nya membaca kredensial dari env var TUNGGAL
  (INDODAX_API_KEY/INDODAX_SECRET_KEY) -- tidak kompatibel
  dengan sistem multi-akun berbasis Firestore yang sekarang
  jadi standar di seluruh project ini (lihat trading/live.ts).
- Sekarang IndodaxClient WAJIB disuntikkan lewat constructor
  (tidak ada default diam-diam) -- kalau lupa disediakan,
  TypeScript akan menolak compile, bukan diam-diam jalan
  dengan kredensial kosong/salah.
- Tambah createExchangeAccountService() sebagai factory resmi:
  otomatis ambil kredensial dari akun aktif Firestore, fail-loud
  kalau tidak ada akun dikonfigurasi (pola sama persis dengan
  trading/live.ts dan
  liveTrading/exchange/createIndodaxExchangeClient.ts).
==========================================================
Indodax Account Balance Adapter
==========================================================
*/

import type {
  ExchangeBalance,
  AccountAsset,
  ExchangeResponse,
} from "../types";

import { IndodaxClient } from "./indodaxClient";
import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";

export class ExchangeAccountService {

  private lastBalance: ExchangeBalance | null = null;

  /**
   * IndodaxClient WAJIB disediakan pemanggil -- tidak ada
   * default. Pakai createExchangeAccountService() di bawah
   * kalau ingin otomatis memakai akun aktif dari Firestore.
   */
  public constructor(
    private readonly client: IndodaxClient,
  ) {}

  /**
   * Get full account balance
   */
  async getBalance(): Promise<ExchangeBalance> {

    const response = await this.client.privateRequest("getInfo", {});

    if (!response.success) {
      throw new Error(response.message);
    }

    const balance = this.normalizeBalance(response);

    this.lastBalance = balance;

    return balance;

  }

  /**
   * Get single asset balance
   */
  async getAsset(symbol: string): Promise<AccountAsset | null> {

    const account = await this.getBalance();

    return (
      account.assets.find((asset) => asset.symbol === symbol) ?? null
    );

  }

  /**
   * Available IDR
   */
  async getIDRBalance() {

    const asset = await this.getAsset("idr");

    return asset ? asset.available : 0;

  }

  /**
   * Normalize exchange response
   */
  private normalizeBalance(response: ExchangeResponse): ExchangeBalance {

    const balance = response.data.balance;

    const assets: AccountAsset[] = [];

    Object.keys(balance).forEach((symbol) => {

      assets.push({
        symbol,
        available: Number(balance[symbol]),
        locked: 0,
      });

    });

    return {
      assets,
      timestamp: Date.now(),
    };

  }

  /**
   * Cached balance
   */
  getCached() {
    return this.lastBalance;
  }

}

/**
 * Factory resmi: membuat ExchangeAccountService dengan kredensial
 * dari AKUN AKTIF di Firestore -- bukan env var tunggal. Melempar
 * error kalau tidak ada akun aktif yang dikonfigurasi (JANGAN
 * fallback diam-diam), sama seperti pola di trading/live.ts.
 */
export async function createExchangeAccountService(): Promise<ExchangeAccountService> {

  const account = await getActiveIndodaxAccount();

  if (!account) {
    throw new Error(
      "Tidak ada akun Indodax aktif yang ditemukan (cek BOT_OWNER_UID & isActive di dashboard settings)."
    );
  }

  const client = new IndodaxClient({
    apiKey: account.apiKey,
    secretKey: account.secretKey,
  });

  return new ExchangeAccountService(client);

}

export default createExchangeAccountService;
