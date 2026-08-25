/**
==========================================================
AURA Trade OS
Live Sell Order Validator
Version : 0.1.0 Alpha
==========================================================
Pasangan liveOrderValidator.ts (BUY) untuk SELL -- pakai
services/validation/ juga, TAPI bagian yang berbeda dari
framework yang sama (ObjectValidator + PrimitiveValidator +
ValidationFactory, SEBELUMNYA 100% orphan, 0 importer sama
sekali - beda dari SchemaValidator yang sudah dipakai
liveOrderValidator.ts).

Kenapa file TERPISAH (bukan reuse SchemaValidator seperti
BUY): sengaja, untuk membuktikan sisi LAIN dari framework
validation/ ini (schema-based vs composable object+primitive)
juga benar-benar berfungsi, bukan cuma satu pendekatan yang
kebetulan dipakai lalu sisanya didiamkan selamanya.

CELAH YANG DITUTUP: SEBELUM file ini, sellInternal() di
trading/live.ts HANYA cek `amount > 0` -- TIDAK PERNAH
memvalidasi FORMAT PAIR sama sekali untuk SELL (BUY sudah,
lewat liveOrderValidator.ts). Kalau pair yang salah format
somehow lolos sampai ke sellInternal() (mis. bug di pemanggil
upstream), request tetap akan dikirim ke Indodax dan baru
gagal di sana dengan pesan mentah dari API mereka.

Dipanggil dari trading/live.ts sellInternal() SEBELUM
client.trade(), sebagai TAMBAHAN (bukan pengganti) cek
`amount > 0` yang sudah ada -- cek itu tetap jadi bailout
tercepat untuk kasus paling umum (amount kosong/negatif dari
posisi yang salah baca).
==========================================================
*/

import { ValidationFactory } from "@/services/validation/validationFactory";
import { validationManager } from "@/services/validation/validationManager";
import { PAIR_PATTERN } from "./liveOrderValidator";

interface LiveSellOrderInput {
  pair: string;
  amount: number;
}

const sellValidator = ValidationFactory.create<LiveSellOrderInput>({
  type: "object",
  options: {
    allowUnknown: true,
    fields: {
      pair: {
        required: true,
        validator: ValidationFactory.create({
          type: "primitive",
          options: { type: "string", pattern: PAIR_PATTERN },
        }),
      },
      amount: {
        required: true,
        // PrimitiveValidator tidak punya opsi "strictly greater
        // than zero" eksplisit, cuma min/max inklusif -- Number.
        // MIN_VALUE (bilangan positif terkecil yang representable
        // di JS, BUKAN 0) dipakai supaya efeknya sama dengan ">0"
        // untuk semua nilai amount koin yang bermakna secara
        // praktis. Batas amount<=0 yang SEBENARNYA tetap
        // ditegakkan terpisah di sellInternal() (cek `!request.
        // amount || request.amount <= 0` yang sudah ada sebelum
        // file ini dipanggil sama sekali) -- jadi tidak ada celah
        // walau batasnya di sini secara teknis tidak 100% presisi.
        validator: ValidationFactory.create({
          type: "primitive",
          options: { type: "number", min: Number.MIN_VALUE },
        }),
      },
    },
  },
});

validationManager.register("live.order.sell", sellValidator, {
  description: "Pre-flight SELL order live (pair format + amount positif)",
});

export interface LiveSellOrderValidationResult {
  valid: boolean;
  /** Pesan gabungan, siap dipakai langsung di Error/log. */
  message: string;
}

/**
 * Validasi order SELL live SEBELUM dikirim ke Indodax. Return
 * {valid:false} berarti order TIDAK BOLEH dikirim -- pemanggil
 * (trading/live.ts sellInternal()) wajib throw/berhenti.
 */
export function validateLiveSellOrder(
  input: LiveSellOrderInput
): LiveSellOrderValidationResult {

  const result = sellValidator.validate(input);

  if (result.valid) {
    return { valid: true, message: "OK" };
  }

  const message = result.issues
    .map((issue) => `${issue.path}: ${issue.message}`)
    .join("; ");

  return { valid: false, message };

}
