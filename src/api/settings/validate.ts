/**
==========================================================
AURA Trade OS
Settings Input Validation
Version : 0.1.0 Alpha
==========================================================
INTEGRASI src/lib/validators/* (sebelumnya orphan total -- 15
file, ~3200 baris, tidak diimpor dari mana pun) ke titik yang
genuinely membutuhkan: PUT /api/settings SEBELUMNYA menulis body
dari client LANGSUNG ke Firestore tanpa validasi apa pun sama
sekali (lihat git blame service.ts sebelum file ini ada) --
operator bisa tidak sengaja menyimpan stopLossPercent negatif,
tradeAmountIdr NaN, atau takeProfitPercent < stopLossPercent
lewat dashboard tanpa ada error yang jelas.

Kenapa CUMA 4 dari 15 file lib/validators/* yang dipakai di sini
(number.ts, risk.ts, validateTradingPair dari market.ts, dan
PairValidator.normalize() SAJA dari pair.ts):
- PairValidator.validate()/trade.ts/scanner.ts/portfolio.ts SENGAJA
  TIDAK dipakai: PairValidator.validate() menolak pair di luar
  whitelist 10 pair hardcode -- bertentangan langsung dengan scanner
  yang sekarang scan SEMUA pair Indodax. market.ts.validateTradingPair()
  dipakai sebagai gerbang FORMAT (regex), tanpa whitelist.
  PairValidator.normalize() (BUKAN .validate()) dipakai SEBELUM itu
  murni untuk reformat string (BTC-IDR/btcidr -> btc_idr) -- method
  ini tidak menyentuh whitelist sama sekali, aman dipakai bersama
  full-market scanner.
- trading.ts & strategy.ts SENGAJA TIDAK dipakai: isinya duplikat/
  bersaing dengan risk.ts (trading.ts) dan services/strategy/*
  (strategy.ts) yang sudah jadi sumber kebenaran live -- memakainya
  di sini cuma menambah kode tanpa kapabilitas baru.
- config.ts SENGAJA TIDAK dipakai: dirancang untuk BotConfiguration
  single-pair lama (field `pair: string`), tidak cocok dengan
  bentuk BotSettings sekarang (`pairs: string[]`).
- order.ts SENGAJA TIDAK dipakai: sudah ada padanan yang lebih baik
  DAN SUDAH LIVE di services/trading/liveOrderValidator.ts (dipakai
  live.ts sebelum kirim order ke Indodax).

Validasi di sini TIDAK throw untuk field yang tidak dikirim
(partial update tetap didukung) -- cuma memvalidasi field yang
memang ada di body request.
==========================================================
*/

import { AppError } from "@/lib/error/AppError";
import NumberValidator from "@/lib/validators/number";
import RiskValidator from "@/lib/validators/risk";
import { validateTradingPair } from "@/lib/validators/market";
import PairValidator from "@/lib/validators/pair";
import type { BotSettings } from "./types";

const VALID_MODES = ["paper", "live"] as const;
const VALID_STRATEGY_MODES = ["CONSERVATIVE", "BALANCED", "AGGRESSIVE"] as const;

/**
 * Validasi partial update BotSettings dari body PUT /api/settings.
 * Throw AppError (code: VALIDATION_ERROR) kalau ada field yang
 * dikirim tapi nilainya tidak valid. Field yang tidak dikirim
 * (undefined) dilewati -- tidak wajib lengkap tiap request.
 */
export function validateSettingsInput(
  partial: Partial<BotSettings>
): void {
  if (partial.mode !== undefined) {
    if (!VALID_MODES.includes(partial.mode)) {
      throw AppError.validation(
        `mode harus salah satu dari: ${VALID_MODES.join(", ")}.`
      );
    }
  }

  if (partial.strategyMode !== undefined) {
    if (!VALID_STRATEGY_MODES.includes(partial.strategyMode)) {
      throw AppError.validation(
        `strategyMode harus salah satu dari: ${VALID_STRATEGY_MODES.join(", ")}.`
      );
    }
  }

  if (partial.tradeAmountIdr !== undefined) {
    NumberValidator.positive(partial.tradeAmountIdr, "tradeAmountIdr");
  }

  if (partial.scanIntervalMinutes !== undefined) {
    NumberValidator.positive(
      partial.scanIntervalMinutes,
      "scanIntervalMinutes"
    );
  }

  // RiskValidator.validate() butuh stopLossPercent, takeProfitPercent,
  // DAN maxOpenPosition bersamaan (buat cek TP >= SL) -- kalau
  // request cuma kirim SEBAGIAN dari ketiganya, ambil nilai yang
  // tidak dikirim dari field lain yang SUDAH ADA di partial supaya
  // validateRiskReward tidak salah bandingkan dengan undefined.
  const hasRiskField =
    partial.stopLossPercent !== undefined ||
    partial.targetProfitPercent !== undefined ||
    partial.maxOpenPositions !== undefined;

  if (hasRiskField) {
    if (partial.stopLossPercent !== undefined) {
      RiskValidator.validateStopLoss(partial.stopLossPercent);
    }

    if (partial.targetProfitPercent !== undefined) {
      RiskValidator.validateTakeProfit(partial.targetProfitPercent);
    }

    if (
      partial.stopLossPercent !== undefined &&
      partial.targetProfitPercent !== undefined
    ) {
      RiskValidator.validateRiskReward(
        partial.stopLossPercent,
        partial.targetProfitPercent
      );
    }

    if (partial.maxOpenPositions !== undefined) {
      RiskValidator.validateMaxOpenPosition(partial.maxOpenPositions);
    }
  }

  if (partial.pairs !== undefined) {
    if (!Array.isArray(partial.pairs)) {
      throw AppError.validation("pairs harus berupa array string.");
    }

    // PairValidator.normalize() dipakai HANYA untuk reformat string
    // (BTC-IDR / btcidr / "  Btc_Idr  " -> btc_idr) -- BUKAN
    // PairValidator.validate() yang membatasi ke whitelist 10 pair
    // (lihat catatan integrasi di atas). Hasil normalisasi ditulis
    // BALIK ke partial.pairs[i] (mutasi in-place) supaya yang benar-
    // benar tersimpan ke Firestore adalah bentuk konsisten
    // "btc_idr", bukan variasi format apa pun yang dikirim client.
    for (let i = 0; i < partial.pairs.length; i++) {
      const normalized = PairValidator.normalize(partial.pairs[i]);
      partial.pairs[i] = validateTradingPair(normalized);
    }
  }
}
