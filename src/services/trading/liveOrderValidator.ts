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

/**
 * Minimum transaksi Indodax adalah Rp10.000. Catatan dari
 * help.indodax.com: transaksi Rp10.000-Rp24.999 diproses lewat
 * "Indodax Lite", sedangkan >=Rp25.000 langsung lewat "Indodax
 * Pro" -- keduanya SAMA-SAMA valid/diproses, cuma beda jalur
 * internal (belum dipastikan apakah beda ini berlaku juga untuk
 * TAPI/private REST API, atau cuma di web/app UI konsumer).
 * Lihat catatan yang sama di config/bot.ts dan
 * services/trading/effectiveConfig.ts -- kalau berubah, update
 * di ketiga tempat itu.
 */
export const INDODAX_MIN_ORDER_IDR = 10_000;

/**
 * Format pair Indodax: huruf kecil, underscore sebelum "idr"
 * (mis. "btc_idr"). Sumber: dokumentasi resmi
 * (github.com/btcid/indodax-official-api-docs).
 */
const PAIR_PATTERN = /^[a-z0-9]+_idr$/;

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
