/**
==========================================================
AURA Trade OS
Indodax Exchange Client Factory
Version : 0.1.0 Alpha

TUJUAN:
IndodaxAdapter/IndodaxExchangeClient (services/liveTrading/
exchange/indodaxAdapter.ts) secara desain sudah BENAR (parameter
trade sesuai spesifikasi Indodax, delegasi ke signer/response
parser yang aman) dan mengimplementasikan interface ExchangeClient
GENERIK -- fondasi yang tepat untuk dukungan multi-exchange di
masa depan.

Satu-satunya kekurangannya: default constructor-nya
(createIndodaxAuthConfig()) membaca kredensial dari environment
variable TUNGGAL (INDODAX_API_KEY/INDODAX_API_SECRET), padahal
seluruh sistem ini sudah pindah ke model MULTI-AKUN tersimpan di
Firestore (lihat services/firebase/indodaxAccountsAdmin.ts,
dipakai services/trading/live.ts).

Factory ini menjembatani keduanya: membangun IndodaxAdapter
dengan config yang HARUS diisi eksplisit dari akun aktif di
Firestore, TANPA mengubah default env-var-based constructor
yang sudah ada (supaya tidak berisiko ke pemanggil lain yang
mungkin masih bergantung pada perilaku default itu).

BELUM dipanggil dari trading/live.ts atau jalur eksekusi live
manapun -- trading/live.ts saat ini bekerja dengan baik memakai
IndodaxClient secara langsung, dan TIDAK ADA alasan mengganti
jalur yang sudah terbukti jalan hanya demi keseragaman arsitektur.
Factory ini disiapkan sebagai TITIK MASUK untuk saat sistem benar-
benar mendukung exchange kedua: kode pemanggil baru cukup pakai
interface ExchangeClient generik ini, tanpa perlu tahu detail
Indodax sama sekali.
==========================================================
*/

import { getActiveIndodaxAccount } from "@/services/firebase/indodaxAccountsAdmin";
import { IndodaxAdapter, IndodaxExchangeClient } from "./indodaxAdapter";
import type { IndodaxAuthConfig } from "./indodaxAuth";

const INDODAX_TAPI_URL = "https://indodax.com/tapi";
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Membuat IndodaxExchangeClient (implementasi ExchangeClient
 * generik untuk Indodax) dengan kredensial dari AKUN AKTIF di
 * Firestore -- bukan dari env var tunggal.
 *
 * Melempar error kalau tidak ada akun aktif yang dikonfigurasi
 * (sama seperti pola fail-loud di trading/live.ts) -- JANGAN
 * fallback diam-diam ke env var, supaya jelas kalau memang belum
 * ada akun yang dikonfigurasi.
 */
export async function createIndodaxExchangeClient(): Promise<IndodaxExchangeClient> {

  const account = await getActiveIndodaxAccount();

  if (!account) {
    throw new Error(
      "Tidak ada akun Indodax aktif yang ditemukan (cek BOT_OWNER_UID & isActive di dashboard settings)."
    );
  }

  const config: IndodaxAuthConfig = {
    apiUrl: INDODAX_TAPI_URL,
    credentials: {
      apiKey: account.apiKey,
      apiSecret: account.secretKey,
    },
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  const adapter = new IndodaxAdapter({ config });

  return new IndodaxExchangeClient(adapter);

}
