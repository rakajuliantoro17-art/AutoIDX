/**
==========================================================
AURA Trade OS
Live Order Validator
Version : 0.1.0 Alpha
==========================================================
Pre-flight check sebelum order live BENAR-BENAR dikirim ke
Indodax -- pakai services/validation/ (framework generik yang
sebelumnya orphan, nol validator terdaftar untuk apa pun di
project ini).

Kenapa ini penting: SEBELUM ada file ini, tidak ada satupun
pengecekan pair/nominal sebelum request dikirim ke Indodax --
kalau nominal di bawah minimum order Indodax (Rp25.000,
terverifikasi resmi) atau format pair salah, request tetap
dikirim dan baru gagal di sisi Indodax dengan pesan error
mentah dari API mereka, bukan pesan yang jelas dari sistem
kita sendiri.

Dipanggil dari trading/live.ts SEBELUM client.trade().
==========================================================
*/

import { SchemaValidator } from "@/services/validation/schemaValidator";
import type { Schema } from "@/services/validation/schema";
import { validationManager } from "@/services/validation/validationManager";
import { MIN_ORDER_VALUE } from "@/config/limits";

/**
 * Minimum transaksi Indodax adalah Rp10.000. Catatan dari
 * help.indodax.com: transaksi Rp10.000-Rp24.999 diproses lewat
 * "Indodax Lite", sedangkan >=Rp25.000 langsung lewat "Indodax
 * Pro" -- keduanya SAMA-SAMA valid/diproses, cuma beda jalur
 * internal (belum dipastikan apakah beda ini berlaku juga untuk
 * TAPI/private REST API, atau cuma di web/app UI konsumer).
 *
 * Diambil dari config/limits.ts (MIN_ORDER_VALUE) -- SEBELUMNYA
 * angka ini di-hardcode ulang terpisah di sini, effectiveConfig.ts,
 * DAN utils/constants.ts (3 tempat, gampang salah satu ketinggalan
 * kalau diubah). effectiveConfig.ts sudah lebih dulu disambungkan
 * ke config/limits.ts -- file ini menyusul supaya konsisten.
 */
export const INDODAX_MIN_ORDER_IDR = MIN_ORDER_VALUE;

/**
 * Format pair Indodax: huruf kecil, underscore sebelum "idr"
 * (mis. "btc_idr"). Sumber: dokumentasi resmi
 * (github.com/btcid/indodax-official-api-docs).
 */
export const PAIR_PATTERN = /^[a-z0-9]+_idr$/;

interface LiveOrderInput {
  pair: string;
  tradeAmountIdr: number;
}

const liveOrderSchema: Schema = {
  fields: [
    {
      name: "pair",
      rules: ["required", "string", "pattern"],
      options: { pattern: PAIR_PATTERN },
    },
    {
      name: "tradeAmountIdr",
      rules: ["required", "number", "min"],
      options: { min: INDODAX_MIN_ORDER_IDR },
    },
  ],
};

const validator = new SchemaValidator<LiveOrderInput>(liveOrderSchema);

// Didaftarkan ke validationManager.ts (services/validation/, SEBELUMNYA
// orphan - lihat liveSellValidator.ts untuk pasangan SELL-nya dan
// penjelasan lengkap kenapa disambungkan) supaya ada SATU titik
// terpusat untuk menemukan semua validator live-trading yang aktif,
// tanpa mengubah cara validateLiveOrder() di bawah ini bekerja sama
// sekali (function ini TETAP jalur utama yang dipanggil live.ts,
// registrasi ini cuma tambahan untuk discoverability).
validationManager.register("live.order.buy", validator, {
  description: "Pre-flight BUY order live (pair format + minimum nominal Indodax)",
});

export interface LiveOrderValidationResult {
  valid: boolean;
  /** Pesan gabungan, siap dipakai langsung di Error/log. */
  message: string;
}

/**
 * Validasi order live SEBELUM dikirim ke Indodax. Return
 * {valid:false} berarti order TIDAK BOLEH dikirim -- pemanggil
 * (trading/live.ts) wajib throw/berhenti, bukan lanjut dengan
 * peringatan saja.
 */
export function validateLiveOrder(
  input: LiveOrderInput
): LiveOrderValidationResult {

  const result = validator.validate(input);

  if (result.valid) {
    return { valid: true, message: "OK" };
  }

  const message = result.issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join("; ");

  return { valid: false, message };

}
